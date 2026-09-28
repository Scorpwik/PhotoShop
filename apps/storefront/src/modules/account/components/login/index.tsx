import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="login-page"
    >
      <p className="text-accent mb-3 text-xs font-bold uppercase tracking-widest">
        Cuenta
      </p>
      <h1 className="mb-3 text-3xl font-black text-text-primary">
        Inicia sesión
      </h1>
      <p className="mb-8 text-center text-sm text-text-secondary">
        Entra para ver tus pedidos y pagar más rápido.
      </p>
      {message?.state === "verification_required" && (
        <div
          className="mb-6 w-full rounded-2xl border border-white/10 bg-dark-200 p-4 text-center text-sm text-text-secondary"
          data-testid="login-verification-message"
        >
          We sent a verification link to <strong>{message.email}</strong>.
          Please verify your email, then sign in.
        </div>
      )}
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Correo"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label="Contraseña"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="login-error-message"
        />
        <SubmitButton
          data-testid="sign-in-button"
          className="mt-6 w-full !rounded-full !bg-accent !text-white hover:!bg-accent/85"
        >
          Entrar
        </SubmitButton>
      </form>
      <span className="mt-6 text-center text-sm text-text-secondary">
        ¿No tienes cuenta?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="font-bold text-accent"
          data-testid="register-button"
        >
          Regístrate
        </button>
      </span>
    </div>
  )
}

export default Login
