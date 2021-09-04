package main

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/s8508235/tui-dictionary/pkg/log"
	"gorm.io/gorm"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/sessions"
	"github.com/s8508235/react-dictionary-backend/model"
	"github.com/s8508235/react-dictionary-backend/pkg/constant"
	"github.com/s8508235/react-dictionary-backend/repository/postgres"
	"github.com/s8508235/react-dictionary-backend/repository/sessionstore"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/sync/errgroup"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()
	err := godotenv.Load()
	if err != nil {
		panic(fmt.Errorf("loading .env file failed"))
	}
	logger := log.New()
	db, err := postgres.NewPostgresConnection(logger, os.Getenv("POSTGRES_HOST"), os.Getenv("POSTGRES_USER"), os.Getenv("POSTGRES_PASSWD"), os.Getenv("POSTGRES_DB"), os.Getenv("POSTGRES_PORT"))
	if err != nil {
		panic(fmt.Errorf("unable to establish postgres connection: %w", err))
	}

	store, err := sessionstore.New(os.Getenv("REDIS_ENDPOINT"), os.Getenv("REDIS_PASSWD"))
	if err != nil {
		panic(fmt.Errorf("unable to init redis session store: %w", err))
	}
	router := gin.Default()
	allowOrigins := strings.Split(os.Getenv("ALLOW_HOSTS"), ",")
	router.Use(cors.New(cors.Config{
		AllowOrigins:     allowOrigins,
		AllowMethods:     []string{"POST", "GET", "DELETE"},
		AllowHeaders:     []string{"Content-Type", "Access-Control-Allow-Origin", "Access-Control-Allow-Headers", "Access-Control-Allow-Methods"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           10 * time.Minute,
	}))
	router.Use(sessions.Sessions(constant.SessionName, store))

	router.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "pong"})
	})

	router.GET("/auth", isLogin(logger))
	router.POST("/signup", signUp(logger, db))
	router.POST("/login", logIn(logger, db))
	router.DELETE("/logout", logOut(logger, db))

	srv := &http.Server{
		Addr:    ":8080",
		Handler: router,
	}

	errWg, errCtx := errgroup.WithContext(ctx)

	errWg.Go(func() error {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			return err
		}
		return nil
	})

	errWg.Go(func() error {
		<-errCtx.Done()
		stop()
		return srv.Shutdown(errCtx)
	})

	err = errWg.Wait()

	if err == context.Canceled || err == nil {
		fmt.Println("gracefully quit server")
	} else if err != nil {
		fmt.Println(err)
	}
}

func signUp(logger *log.Logger, db *gorm.DB) gin.HandlerFunc {

	return func(c *gin.Context) {
		u := struct {
			Username string `json:"username"`
			Passwd   string `json:"passwd"`
		}{}
		if err := c.BindJSON(&u); err != nil {
			logger.Logrus.Error(err)
			c.JSON(http.StatusInternalServerError, "bind json failed")
			return
		}
		// TODO: add verifier to username/passwd
		hashPasswd, err := bcrypt.GenerateFromPassword([]byte(u.Passwd), bcrypt.DefaultCost)
		if err != nil {
			logger.Logrus.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "generate signature failed"})
			return
		}
		user := model.User{Username: u.Username, PasswordSignature: hashPasswd}
		result := db.Create(&user)
		if result.Error != nil {
			logger.Logrus.Error(result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "save to database failed"})
			return
		}
		c.JSON(http.StatusOK, "new a user")
	}
}

func logIn(logger *log.Logger, db *gorm.DB) gin.HandlerFunc {

	return func(c *gin.Context) {
		u := struct {
			Username string `json:"username"`
			Passwd   string `json:"passwd"`
		}{}
		if err := c.BindJSON(&u); err != nil {
			logger.Logrus.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "parse body failed"})
			return
		}
		user := model.User{}
		result := db.First(&user, "username = ?", u.Username)
		if result.Error != nil {
			logger.Logrus.Error(result.Error)
			c.JSON(http.StatusNotFound, nil)
			return
		}

		if err := bcrypt.CompareHashAndPassword(user.PasswordSignature, []byte(u.Passwd)); err != nil {
			logger.Logrus.Error(err)
			c.JSON(http.StatusBadRequest, nil)
			return
		}

		session := sessions.Default(c)
		session.Set(constant.UserName, u.Username)
		if err := session.Save(); err != nil {
			logger.Logrus.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "session error"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "you're a user"})
	}
}

func logOut(logger *log.Logger, db *gorm.DB) gin.HandlerFunc {

	return func(c *gin.Context) {
		session := sessions.Default(c)
		session.Set(constant.UserName, "") // this will mark the session as "written" and hopefully remove the username
		session.Clear()
		session.Options(sessions.Options{Path: "/", MaxAge: -1}) // this sets the cookie with a MaxAge of 0
		if err := session.Save(); err != nil {
			logger.Logrus.Error(err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "session error"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "delete session success"})
	}
}

func isLogin(logger *log.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		session := sessions.Default(c)
		logger.Logrus.Info("untransformed login user is :", session.Get(constant.UserName))
		userName, valid := session.Get(constant.UserName).(string)
		if !valid {
			c.AbortWithError(http.StatusInternalServerError, errors.New("user name is not string"))
		}
		logger.Logrus.Info("login user is :", userName)
		c.Next()
	}
}
