package sessionstore

import (
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/redis"
	"github.com/gorilla/securecookie"
)

func New(endpoint, password string) (redis.Store, error) {
	store, err := redis.NewStore(10, "tcp", endpoint, password, securecookie.GenerateRandomKey(32))
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
