import InputError from '@/Components/ui/InputError';
import InputLabel from '@/Components/ui/InputLabel';
import PrimaryButton from '@/Components/ui/PrimaryButton';
import TextInput from '@/Components/ui/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        correo: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post('/forgot-password');
    };

    return (
        <>
            <Head title="Recuperar contraseña" />

            <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
                {/* ═══════════════════════════════════════════════
                    PANEL IZQUIERDO — MARCA CON GLASSMORPHISM
                ═══════════════════════════════════════════════ */}
                <div className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden bg-gradient-to-tr from-slate-900 via-blue-950 to-indigo-900 p-8">
                    {/* Elementos decorativos */}
                    <div className="absolute inset-0">
                        <div className="absolute -top-48 -right-48 w-[36rem] h-[36rem] bg-blue-500/20 rounded-full blur-3xl" />
                        <div className="absolute -bottom-48 -left-48 w-[36rem] h-[36rem] bg-indigo-500/20 rounded-full blur-3xl" />
                        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
                        <div
                            className="absolute inset-0 opacity-[0.03]"
                            style={{
                                backgroundImage:
                                    'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
                                backgroundSize: '32px 32px',
                            }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 h-64 opacity-[0.05]">
                            <svg
                                className="w-full h-full"
                                viewBox="0 0 1440 320"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                preserveAspectRatio="none"
                            >
                                <path
                                    d="M0 256L48 240C96 224 192 192 288 176C384 160 480 160 576 170.7C672 181.3 768 202.7 864 213.3C960 224 1056 224 1152 208C1248 192 1344 160 1392 144L1440 128V320H1392C1344 320 1248 320 1152 320C1056 320 960 320 864 320C768 320 672 320 576 320C480 320 384 320 288 320C192 320 96 320 48 320H0V256Z"
                                    fill="url(#wave-gradient)"
                                />
                                <defs>
                                    <linearGradient id="wave-gradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="white" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>

                    {/* Contenedor Glassmorphism */}
                    <div className="relative z-10 bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-2xl shadow-2xl max-w-md mx-auto">
                        <div className="mb-8 flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-400/30 rounded-full blur-3xl animate-pulse" />
                                <img
                                    src="/imagenes/Logo-Ficct.png"
                                    alt="Logo FICCT"
                                    className="relative w-24 h-24 object-contain drop-shadow-2xl"
                                />
                            </div>
                        </div>

                        <div className="text-center">
                            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight mb-4">
                                ¿Olvidaste tu
                                <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                                    contraseña?
                                </span>
                            </h1>
                            <p className="text-base text-blue-200/70 leading-relaxed">
                                No te preocupes, te enviaremos un enlace para que puedas
                                restablecerla de forma segura.
                            </p>
                        </div>

                        <div className="my-8 flex items-center gap-4">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            <div className="w-2 h-2 rounded-full bg-blue-400/40" />
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </div>

                        <div className="flex items-center justify-center gap-6">
                            <div className="flex items-center gap-2 text-blue-300/60">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span className="text-xs font-medium tracking-wide">Seguro</span>
                            </div>
                            <div className="flex items-center gap-2 text-blue-300/60">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span className="text-xs font-medium tracking-wide">Rápido</span>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-8 left-0 right-0 text-center">
                        <p className="text-xs text-blue-300/30 tracking-wide">
                            &copy; {new Date().getFullYear()} FICCT — UAGRM
                        </p>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════
                    PANEL DERECHO — FORMULARIO PREMIUM
                ═══════════════════════════════════════════════ */}
                <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
                    {/* Logo móvil */}
                    <div className="lg:hidden flex flex-col items-center mb-8">
                        <div className="relative mb-3">
                            <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl" />
                            <img src="/imagenes/Logo-Ficct.png" alt="Logo FICCT" className="relative w-16 h-16 object-contain" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Curso Preuniversitario FICCT</h2>
                    </div>

                    {/* Tarjeta del formulario */}
                    <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl shadow-slate-200/50 max-w-md w-full border border-slate-100">
                        {/* Volver al inicio de sesión */}
                        <Link
                            href="/login"
                            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 mb-6 transition-colors duration-200 group"
                        >
                            <svg
                                className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform duration-200"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Volver al inicio de sesión
                        </Link>

                        {/* Encabezado */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
                                Recuperar contraseña
                            </h2>
                            <p className="text-sm text-slate-500 mt-2">
                                Ingresa tu correo institucional para recibir el enlace de restablecimiento
                            </p>
                        </div>

                        {/* Mensaje de estado */}
                        {status && (
                            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                                <p className="text-sm font-medium text-emerald-700">{status}</p>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            {/* Campo: Correo */}
                            <div>
                                <InputLabel
                                    htmlFor="correo"
                                    value="Correo electrónico"
                                    className="text-sm font-semibold text-slate-700"
                                />
                                <div className="relative mt-1.5">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg
                                            className="w-5 h-5 text-slate-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                    <TextInput
                                        id="correo"
                                        type="email"
                                        value={data.correo}
                                        className="block w-full pl-11 pr-4 p-4 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all duration-200 shadow-inner"
                                        autoComplete="email"
                                        isFocused
                                        onChange={(event) => setData('correo', event.target.value)}
                                        placeholder="tu@correo.com"
                                    />
                                </div>
                                {errors.correo && (
                                    <div className="mt-2 p-2 rounded-lg bg-red-50 border border-red-100">
                                        <p className="text-xs text-red-600">{errors.correo}</p>
                                    </div>
                                )}
                                <InputError message={errors.correo} className="mt-1.5 text-xs text-red-500 hidden" />
                            </div>

                            {/* Botón de acción */}
                            <div className="pt-2">
                                <PrimaryButton
                                    disabled={processing}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl p-4 shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transform hover:-translate-y-0.5 transition-all duration-200 justify-center"
                                >
                                    {processing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg
                                                className="animate-spin h-5 w-5 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Enviando...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2 text-base">
                                            Enviar enlace de recuperación
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </span>
                                    )}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>

                    {/* Footer móvil */}
                    <p className="mt-8 text-center text-xs text-slate-400 lg:hidden tracking-wide">
                        &copy; {new Date().getFullYear()} FICCT — UAGRM
                    </p>
                </div>
            </div>
        </>
    );
}