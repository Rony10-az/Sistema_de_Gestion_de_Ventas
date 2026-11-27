'use client';

// Estado global de sesión: usuario autenticado + token JWT.
// Persiste el token en localStorage para no perder la sesión al recargar.
// Cualquier página/componente que necesite saber "quién está logueado"
// consume este contexto con el hook useAuth (src/hooks/useAuth.js).
//
// `cargando` es true mientras se lee la sesión guardada: las páginas protegidas
// esperan a que termine antes de decidir si mandan al login.

import { createContext, useCallback, useEffect, useState } from 'react';
import * as authService from '../services/auth.service';

export const AuthContext = createContext(null);

function leer(clave) {
  try {
    return window.localStorage.getItem(clave);
  } catch {
    return null;
  }
}

function guardar(clave, valor) {
  try {
    if (valor === null) window.localStorage.removeItem(clave);
    else window.localStorage.setItem(clave, valor);
  } catch {
    // Navegación privada o almacenamiento bloqueado: la sesión dura hasta recargar.
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargando, setCargando] = useState(true);

  const logout = useCallback(() => {
    setToken(null);
    setUsuario(null);
    guardar('token', null);
    guardar('usuario', null);
  }, []);

  useEffect(() => {
    const tokenGuardado = leer('token');
    const usuarioGuardado = leer('usuario');
    if (tokenGuardado && usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
        setToken(tokenGuardado);
      } catch {
        guardar('token', null);
        guardar('usuario', null);
      }
    }
    setCargando(false);

    // El fetcher avisa cuando la API responde 401 (token vencido o inválido).
    window.addEventListener('tecnifix:sesion-expirada', logout);
    return () => window.removeEventListener('tecnifix:sesion-expirada', logout);
  }, [logout]);

  async function login(email, password) {
    const data = await authService.login({ email, password });
    setToken(data.token);
    setUsuario(data.usuario);
    guardar('token', data.token);
    guardar('usuario', JSON.stringify(data.usuario));
    return data.usuario;
  }

  return (
    <AuthContext.Provider value={{ usuario, token, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
