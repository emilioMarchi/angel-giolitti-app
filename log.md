## Estado Actual del Dev Server

### Diagnóstico Completo

#### 1. Error `--no-turbopack` — SOLUCIONADO
- Causa: El flag `--no-turbopack` no existe en Next.js 16.2.11/12. Se eliminó del script `dev` en package.json.

#### 2. Turbopack (`next dev`) — FUNCIONAL
- **Error original:** `0xc0000142` (STATUS_DLL_INIT_FAILED) al spawnear proceso hijo para PostCSS
- **Causa:** Node.js v24 + Windows: los child processes crashean al inicializar DLLs
- **Solución:** Se agregó `turbopackPluginRuntimeStrategy: 'workerThreads'` en `next.config.ts` para usar worker_threads en lugar de child_processes para PostCSS
- **Adicional:** Se eliminó archivo `nul` (nombre reservado de Windows) del proyecto que causaba error "FunciÃ³n incorrecta" en Turbopack

#### 3. Webpack (`next dev --webpack`) — FUNCIONAL COMPLETAMENTE
- **Error original:** "Jest worker encountered 2 child process exceptions, exceeding retry limit" en rutas `[slug]`
- **Causa:** Node.js v24 + Windows: jest-worker spawn child processes que fallan al inicializar
- **Solución:** Se agregó `workerThreads: true` y `cpus: 2` en `next.config.ts` para usar worker_threads en lugar de child_processes

### Configuración Aplicada (`next.config.ts`)
```ts
experimental: {
  workerThreads: true,                    // Webpack: usa worker_threads en vez de child_process
  turbopackPluginRuntimeStrategy: 'workerThreads',  // Turbopack: usa worker_threads para PostCSS
  cpus: 2,                                // Limita workers paralelos
}
```

### Scripts Recomendados

```bash
# Desarrollo con Turbopack (recomendado)
npm run dev

# Fallback: Webpack (si Turbopack tiene problemas)
npm run dev:webpack

# Producción
npm run build
npm run start
```
