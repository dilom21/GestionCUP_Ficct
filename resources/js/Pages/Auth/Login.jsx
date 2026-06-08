import { useState, useEffect } from 'react';
import InputError from '@/Components/ui/InputError';
import InputLabel from '@/Components/ui/InputLabel';
import PrimaryButton from '@/Components/ui/PrimaryButton';
import TextInput from '@/Components/ui/TextInput';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Login({ status, bloqueado_hasta }) {
    const [showPassword, setShowPassword] = useState(false);
    const [tiempoRestante, setTiempoRestante] = useState(null);

    useEffect(() => {
        if (bloqueado_hasta) {
            const calcular = () => {
                const ahora = new Date();
                const fin = new Date(bloqueado_hasta);
                const diff = Math.max(0, Math.floor((fin - ahora) / 1000));
                setTiempoRestante(diff);
                return diff;
            };

            calcular();
            const intervalo = setInterval(() => {
                const restante = calcular();
                if (restante <= 0) {
                    clearInterval(intervalo);
                }
            }, 1000);

            return () => clearInterval(intervalo);
        }
    }, [bloqueado_hasta]);

    const bloqueado = tiempoRestante !== null && tiempoRestante > 0;

    const formatearTiempo = (segundos) => {
        const min = Math.floor(segundos / 60);
        const seg = segundos % 60;
        return `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        correo: '',
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Iniciar sesión" />

            <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
                {/* ═══════════════════════════════════════════════
                    PANEL IZQUIERDO — MARCA CON GLASSMORPHISM
                ═══════════════════════════════════════════════ */}
                <div className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden bg-gradient-to-tr from-slate-900 via-blue-950 to-indigo-900 p-8">
                    {/* Elementos decorativos de fondo */}
                    <div className="absolute inset-0">
                        {/* Gradientes radiales */}
                        <div className="absolute -top-48 -right-48 w-[36rem] h-[36rem] bg-blue-500/20 rounded-full blur-3xl" />
                        <div className="absolute -bottom-48 -left-48 w-[36rem] h-[36rem] bg-indigo-500/20 rounded-full blur-3xl" />
                        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
                        
                        {/* Patrón grid sutil */}
                        <div
                            className="absolute inset-0 opacity-[0.03]"
                            style={{
                                backgroundImage:
                                    'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
                                backgroundSize: '32px 32px',
                            }}
                        />

                        {/* Ondas decorativas */}
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
                        {/* Logo */}
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

                        {/* Texto motivacional */}
                        <div className="text-center">
                            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight mb-4">
                                Tu futuro universitario
                                <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                                    comienza aquí
                                </span>
                            </h1>

                            <p className="text-base text-blue-200/70 leading-relaxed">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 font-semibold">
                                    Asegura tu ingreso
                                </span>{' '}
                                a la universidad desde el primer intento. Prepárate con los mejores 
                                en la Facultad de Ciencias de la Computación y Telecomunicaciones.
                            </p>
                        </div>

                        {/* Divisor decorativo */}
                        <div className="my-8 flex items-center gap-4">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            <div className="w-2 h-2 rounded-full bg-blue-400/40" />
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </div>

                        {/* Indicadores visuales */}
                        <div className="flex items-center justify-center gap-6">
                            <div className="flex items-center gap-2 text-blue-300/60">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-xs font-medium tracking-wide">Acceso 24/7</span>
                            </div>
                            <div className="flex items-center gap-2 text-blue-300/60">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span className="text-xs font-medium tracking-wide">Datos seguros</span>
                            </div>
                            <div className="flex items-center gap-2 text-blue-300/60">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span className="text-xs font-medium tracking-wide">Rápido</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer del panel */}
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
                            <img
                                src="/imagenes/Logo-Ficct.png"
                                alt="Logo FICCT"
                                className="relative w-16 h-16 object-contain"
                            />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">
                            Curso Preuniversitario FICCT
                        </h2>
                    </div>

                    {/* Tarjeta del formulario */}
                    <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl shadow-slate-200/50 max-w-md w-full border border-slate-100">
                        {/* Volver al inicio */}
                        <Link
                            href="/"
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
                            Volver al inicio
                        </Link>

                        {/* Encabezado */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
                                ¡Hola de nuevo!
                            </h2>
                            {tiempoRestante !== null && tiempoRestante > 0 && (
                                <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-red-700">
                                            Cuenta temporalmente bloqueada
                                        </p>
                                        <p className="text-xs text-red-500 mt-0.5">
                                            Intenta de nuevo en
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 bg-red-600 text-white font-bold text-lg px-3 py-1.5 rounded-lg min-w-[60px] text-center tabular-nums">
                                        {formatearTiempo(tiempoRestante)}
                                    </div>
                                </div>
                            )}
                            <p className="text-sm text-slate-500 mt-2">
                                Ingresa tus credenciales para acceder al sistema
                            </p>
                        </div>

                        {/* Mensaje de estado */}
                        {status && (
                            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                                <p className="text-sm font-medium text-emerald-700">
                                    {status}
                                </p>
                            </div>
                        )}

                        {errors.token && (
                            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
                                <p className="text-sm font-medium text-red-700">
                                    {errors.token}
                                </p>
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
                                        name="correo"
                                        value={data.correo}
                                        disabled={bloqueado}
                                        className="block w-full pl-11 pr-4 p-4 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all duration-200 shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
                                        autoComplete="username"
                                        isFocused={true}
                                        onChange={(e) => setData('correo', e.target.value)}
                                        placeholder={bloqueado ? 'Esperando desbloqueo...' : 'tu@correo.com'}
                                    />
                                </div>
                                {errors.correo && (
                                    <div className="mt-2 p-2 rounded-lg bg-red-50 border border-red-100">
                                        <p className="text-xs text-red-600">
                                            {errors.correo}
                                        </p>
                                    </div>
                                )}
                                <InputError message={errors.correo} className="mt-1.5 text-xs text-red-500 hidden" />
                            </div>

                            {/* Campo: Contraseña */}
                            <div>
                                <div className="flex items-center justify-between">
                                    <InputLabel
                                        htmlFor="password"
                                        value="Contraseña"
                                        className="text-sm font-semibold text-slate-700"
                                    />
                                </div>
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
                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                            />
                                        </svg>
                                    </div>
                                    <TextInput
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        disabled={bloqueado}
                                        className="block w-full pl-11 pr-12 p-4 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all duration-200 shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder={bloqueado ? 'Esperando desbloqueo...' : '••••••••'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors duration-200"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <div className="mt-2 p-2 rounded-lg bg-red-50 border border-red-100">
                                        <p className="text-xs text-red-600">
                                            {errors.password}
                                        </p>
                                    </div>
                                )}
                                <InputError message={errors.password} className="mt-1.5 text-xs text-red-500 hidden" />
                            </div>

                            {/* Opciones: Recordarme + Olvidé contraseña */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2.5 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/30 cursor-pointer transition-all duration-200"
                                    />
                                    <span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">
                                        Recordarme
                                    </span>
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>

                            {/* Botón de acción */}
                            <div className="pt-2">
                                <PrimaryButton
                                    disabled={processing || bloqueado}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl p-4 shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transform hover:-translate-y-0.5 transition-all duration-200 justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:-translate-y-0"
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
                                            Ingresando...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2 text-base">
                                            Ingresar a la Plataforma
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
