"use client"

import { useActionState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)

  return (
    <div
      className="max-w-sm flex flex-col items-center"
      data-testid="register-page"
    >
      <p className="text-accent mb-3 text-xs font-bold uppercase tracking-widest">
        Cuenta
      </p>
      <h1 className="mb-3 text-center text-3xl font-black text-text-primary">
        Crea tu cuenta
      </h1>
      <p className="mb-4 text-center text-sm text-text-secondary">
        Regístrate para guardar tus pedidos y pagar más rápido.
      </p>
      {message?.state === "verification_required" && (
        <div
          className="mb-4 w-full rounded-2xl border border-white/10 bg-dark-200 p-4 text-center text-sm text-text-secondary"
          data-testid="register-verification-message"
        >
          We sent a verification link to <strong>{message.email}</strong>.
          Please check your inbox to verify your email, then sign in.
        </div>
      )}
      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Nombre"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label="Apellido"
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label="Correo"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="Teléfono"
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label="Contraseña"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>
        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="register-error"
        />
        <span className="mt-6 text-center text-sm text-text-secondary">
          Al crear una cuenta aceptas la{" "}
          <LocalizedClientLink
            href="/content/privacy-policy"
            className="text-accent"
          >
            política de privacidad
          </LocalizedClientLink>{" "}
          y los{" "}
          <LocalizedClientLink href="/content/terms-of-use" className="text-accent">
            términos de uso
          </LocalizedClientLink>
          .
        </span>
        <SubmitButton
          className="mt-6 w-full !rounded-full !bg-accent !text-white hover:!bg-accent/85"
          data-testid="register-button"
        >
          Crear cuenta
        </SubmitButton>
      </form>
      <span className="mt-6 text-center text-sm text-text-secondary">
        ¿Ya tienes cuenta?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="font-bold text-accent"
        >
          Inicia sesión
        </button>
      </span>
    </div>
  )
}

export default Register
