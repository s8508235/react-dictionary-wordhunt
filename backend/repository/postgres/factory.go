package postgres

import (
	"fmt"
	"time"

	"github.com/s8508235/react-dictionary-backend/model"
	"github.com/s8508235/tui-dictionary/pkg/log"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Config struct {
	Host   string `env:"POSTGRES_HOST"`
	Port   string `env:"POSTGRES_PORT"`
	User   string `env:"POSTGRES_USER"`
	Passwd string `env:"POSTGRES_PASSWORD"`
	DB     string `env:"POSTGRES_DB"`
}

func NewPostgresConnection(logger *log.Logger, config Config) (*gorm.DB, error) {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Taipei", config.Host, config.User, config.Passwd, config.DB, config.Port)
	// dsn := "host=localhost user=postgres password=react-dictionary dbname=postgres port=5432 sslmode=disable TimeZone=Asia/Taipei"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger,
	})
	if err != nil {
		return nil, err
	}
	err = db.AutoMigrate(&model.User{}, &model.Dictionary{}, &model.Definition{})
	if err != nil {
		logger.Logrus.Errorln("Fail to migrate db:", err)
		return nil, err
	}
	postgres, err := db.DB()

	if err != nil {
		return nil, err
	}
	// SetMaxIdleConns sets the maximum number of connections in the idle connection pool.
	postgres.SetMaxIdleConns(10)

	// SetMaxOpenConns sets the maximum number of open connections to the database.
	postgres.SetMaxOpenConns(100)

	// SetConnMaxLifetime sets the maximum amount of time a connection may be reused.
	postgres.SetConnMaxLifetime(time.Hour)

	err = postgres.Ping()
	if err != nil {
		panic(fmt.Errorf("unable to ping postgres: %w", err))
	}
	return db, nil
}
