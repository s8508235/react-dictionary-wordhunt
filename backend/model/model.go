package model

import (
	"github.com/gofrs/uuid"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username          string    `gorm:"primaryKey"`
	ID                uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()"`
	PasswordSignature []byte
}

type Dictionary struct {
	gorm.Model
	UserID uuid.UUID `gorm:"index"`
	ID     uint64    `gorm:"primaryKey"`
	Name   string    `gorm:"index"`
	// metrics     interface{}
}

type Definition struct {
	gorm.Model
	Word           string   `gorm:"primaryKey"`
	DictionaryList []uint64 `gorm:"type:bigint[]"`
	Detail         string
}
