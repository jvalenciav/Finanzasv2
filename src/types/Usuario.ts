// src/types/Usuario.ts

export interface Usuario {
    idUsuario: string;
    usuario: string;   // ej. email o nombre de usuario
    nombre: string;
    password: string;  // (en claro, idealmente luego se haría hash)
  }
  