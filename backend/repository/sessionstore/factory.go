package sessionstore

import (
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/redis"
	"github.com/gorilla/securecookie"
)

type Config struct {
	Endpoint string `env:"REDIS_ENDPOINT"`
	Passwd   string `env:"REDIS_PASSWORD"`
}

func New(config Config) (redis.Store, error) {
	store, err := redis.NewStore(10, "tcp", config.Endpoint, config.Passwd, securecookie.GenerateRandomKey(32))
	if err != nil {
		return nil, err
	}
	redis.SetKeyPrefix(store, "react_dictionary_")
	store.Options(sessions.Options{
		MaxAge:   600,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
	})
	return store, nil
}
