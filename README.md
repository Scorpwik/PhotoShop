# CAMERA PRO

Tienda de equipamiento fotográfico. El backend es Medusa y la tienda es Next.js.

El catálogo incluye cámaras, lentes, trípodes y accesorios. Se puede armar el carrito, pagar con el pago manual de prueba, crear una cuenta y ver el pedido confirmado.

Hay dos regiones:

| URL | Región | Moneda |
| --- | --- | --- |
| http://localhost:8000/dk | Europa | EUR |
| http://localhost:8000/ec | Ecuador | USD |

`/dk` es la región por defecto.

## Requisitos

- Node.js 20.19 o superior, o Node.js 22.12 o superior
- [pnpm](https://pnpm.io/) 10
- PostgreSQL 15 o superior

Redis no hace falta para correr el proyecto en local.

## Correr en local

Abre dos terminales en la raíz del repositorio. El backend tiene que estar listo antes de abrir la tienda.

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Crear la base de datos

En PostgreSQL, crea una base vacía. El nombre del template es `medusa-backend`:

```bash
createdb medusa-backend
```

### 3. Configurar el backend

```bash
cp apps/backend/.env.template apps/backend/.env
```

En `apps/backend/.env`, completa `DATABASE_URL` con tu usuario y contraseña de PostgreSQL:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/medusa-backend
```

`JWT_SECRET` y `COOKIE_SECRET` pueden quedarse como `supersecret` en local. Cámbialos si el proyecto sale de tu máquina.

### 4. Migrar y cargar los datos

Desde `apps/backend`:

```bash
cd apps/backend
pnpm exec medusa db:migrate
```

La primera migración crea las regiones, el envío, el catálogo de CAMERA PRO y el inventario.

Crea el usuario del admin:

```bash
pnpm exec medusa user -e admin@test.com -p supersecret
```

### 5. Arrancar el backend

Sigue en `apps/backend`:

```bash
pnpm dev
```

- API: http://localhost:9000
- Admin: http://localhost:9000/app

Entra con `admin@test.com` y `supersecret`. En **Settings → Publishable API Keys**, copia la clave publicable. La tienda no arranca sin ella.

### 6. Configurar la tienda

En otra terminal, desde la raíz, crea `apps/storefront/.env.local`:

```bash
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_tu_clave
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_DEFAULT_REGION=dk
NEXT_PUBLIC_BASE_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_KEY=
```

`NEXT_PUBLIC_STRIPE_KEY` puede quedar vacío. El checkout local usa el pago manual de Medusa.

### 7. Arrancar la tienda

```bash
cd apps/storefront
pnpm dev
```

Abre http://localhost:8000. La tienda redirige a http://localhost:8000/dk.

Para ver precios en dólares, entra a http://localhost:8000/ec.

## Día a día

Con la base ya migrada y los `.env` listos, desde la raíz:

```bash
pnpm dev
```

Eso levanta el backend y la tienda. También puedes usar `pnpm backend:dev` y `pnpm storefront:dev` por separado.

## Páginas

- Inicio: `/dk` o `/ec`
- Tienda: `/dk/store` y `/ec/store`
- Ofertas: `/dk/deals` y `/ec/deals`
- Carrito, checkout y cuenta, con el código de país en la URL
- Admin: http://localhost:9000/app