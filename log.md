# 📋 LOG DE COMUNICACIÓN Y CONFIGURACIONES - angelgiolitti.com.ar

---

## 🌐 1. CONFIGURACIÓN DE CORS PARA CLOUDFLARE R2

Copia y pega la siguiente regla en el panel de **Cloudflare R2**:
👉 **R2 → Tu Bucket → Settings → CORS Policy**:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://angelgiolitti.com.ar"],
    "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["Content-Range", "Accept-Ranges", "Content-Length"]
  }
]
```

---

## 🔑 2. PLANTILLA DE VARIABLES DE ENTORNO (.env.local)

Crea un archivo `.env.local` en la raíz de la aplicación con la siguiente estructura y completa con tus claves:

```env
# SUPABASE CONFIG
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# CLOUDFLARE R2 CONFIG
R2_ACCOUNT_ID=tu_account_id_cloudflare
R2_ACCESS_KEY_ID=tu_access_key_id
R2_SECRET_ACCESS_KEY=tu_secret_access_key
R2_BUCKET_NAME=nombre-de-tu-bucket
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-xxxxxx.r2.dev
```

---

## ✅ 3. ESTADO DEL PROYECTO

- [x] **Base de datos Supabase:** Tablas y políticas RLS creadas correctamente por el usuario.
- [ ] **Configuración R2:** Pendiente aplicación de regla CORS.
- [ ] **Frontend:** Inicialización del proyecto Next.js / React en curso.
