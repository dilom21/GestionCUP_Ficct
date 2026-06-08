import InputError from '@/Components/ui/InputError';
import InputLabel from '@/Components/ui/InputLabel';
import PrimaryButton from '@/Components/ui/PrimaryButton';
import TextInput from '@/Components/ui/TextInput';
import { Head, useForm } from '@inertiajs/react';

import { useState } from 'react';

export default function ResetPassword({ token }) {
    const { data, setData, post, processing, errors } = useForm({
        token,
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const submit = (event) => {
        event.preventDefault();
        post('/reset-password');
    };

    const calcularFuerzaContrasena = (password) => {
        let puntaje = 0;
        if (password.length >= 8) puntaje++;
        if (/[a-z]/.test(password)) puntaje++;
        if (/[A-Z]/.test(password)) puntaje++;
        if (/\d/.test(password)) puntaje++;
        return puntaje;
    };

    const puntaje = calcularFuerzaContrasena(data.password);

    const getBarColor = (index) => {
        if (puntaje <= 2) {
            return index === 0 ? 'bg-red-500' : 'bg-gray-200';
        }
        if (puntaje === 3) {
            return index <= 1 ? 'bg-amber-500' : 'bg-gray-200';
        }
        if (puntaje === 4) {
            return 'bg-green-500';
        }
        return 'bg-gray-200';
    };

    const getLabelStyle = () => {
        if (puntaje <= 2) {
            return 'bg-red-50 border-red-200 text-red-600';
        }
        if (puntaje === 3) {
            return 'bg-amber-50 border-amber-200 text-amber-700';
        }
        if (puntaje === 4) {
            return 'bg-emerald-50 border-emerald-200 text-emerald-700';
        }
        return 'bg-slate-50 border-slate-200 text-slate-500';
    };

    return (
        <>
            <Head title="Nueva contraseña" />

            <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
                {/* ═══════════════════════════════════════════════
                    PANEL IZQUIERDO — MARCA CON GLASSMORPHISM
                ═══════════════════════════════════════════════ */}
                <div className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden bg-gradient-to-tr from-slate-900 via-blue-950 to-indigo-900 p-8">
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
                            <svg className="w-full h-full" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                                <path d="M0 256L48 240C96 224 192 192 288 176C384 160 480 160 576 170.7C672 181.3 768 202.7 864 213.3C960 224 1056 224 1152 208C1248 192 1344 160 1392 144L1440 128V320H1392C1344 320 1248 320 1152 320C1056 320 960 320 864 320C768 320 672 320 576 320C480 320 384 320 288 320C192 320 96 320 48 320H0V256Z" fill="url(#wave-gradient)" />
                                <defs>
                                    <linearGradient id="wave-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="white" stopOpacity="0.4" /><stop offset="100%" stopColor="white" stopOpacity="0" /></linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>

                    <div className="relative z-10 bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-2xl shadow-2xl max-w-md mx-auto">
                        <div className="mb-8 flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-400/30 rounded-full blur-3xl animate-pulse" />
                                <img src="/imagenes/Logo-Ficct.png" alt="Logo FICCT" className="relative w-24 h-24 object-contain drop-shadow-2xl" />
                            </div>
                        </div>
                        <div className="text-center">
                            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight mb-4">
                                Crea tu nueva
                                <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                                    contraseña
                                </span>
                            </h1>
                            <p className="text-base text-blue-200/70 leading-relaxed">
                                Elige una contraseña segura que no hayas usado anteriormente en la plataforma.
                            </p>
                        </div>
                        <div className="my-8 flex items-center gap-4">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            <div className="w-2 h-2 rounded-full bg-blue-400/40" />
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </div>
                        <div className="flex items-center justify-center gap-6">
                            <div className="flex items-center gap-2 text-blue-300/60">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                <span className="text-xs font-medium tracking-wide">Segura</span>
                            </div>
                            <div className="flex items-center gap-2 text-blue-300/60">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span className="text-xs font-medium tracking-wide">Protegida</span>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-8 left-0 right-0 text-center">
                        <p className="text-xs text-blue-300/30 tracking-wide">&copy; {new Date().getFullYear()} FICCT — UAGRM</p>
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
                        {/* Encabezado */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
                                Crear nueva contraseña
                            </h2>
                            <p className="text-sm text-slate-500 mt-2">
                                Usa al menos ocho caracteres, mayúscula, minúscula y número
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            {/* Campo: Nueva contraseña */}
                            <div>
                                <InputLabel
                                    htmlFor="password"
                                    value="Nueva contraseña"
                                    className="text-sm font-semibold text-slate-700"
                                />
                                <div className="relative mt-1.5">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <TextInput
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        className="block w-full pl-11 pr-12 p-4 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all duration-200 shadow-inner"
                                        autoComplete="new-password"
                                        isFocused
                                        onChange={(event) => setData('password', event.target.value)}
                                        placeholder="••••••••"
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
                                        <p className="text-xs text-red-600">{errors.password}</p>
                                    </div>
                                )}
                                <InputError message={errors.password} className="mt-1.5 text-xs text-red-500 hidden" />

                                {/* Medidor de fuerza de contraseña */}
                                {data.password.length > 0 && (
                                    <>
                                        <div className="grid grid-cols-3 gap-2 mt-3">
                                            {[0, 1, 2].map((index) => (
                                                <div
                                                    key={index}
                                                    className={`h-1.5 rounded-full transition-all duration-300 ${getBarColor(index)}`}
                                                />
                                            ))}
                                        </div>
                                        <div className={`mt-2 p-2.5 rounded-lg border transition-all duration-300 ${getLabelStyle()}`}>
                                            <p className="text-[10px] text-center font-semibold tracking-wider leading-relaxed">
                                                LA CONTRASEÑA DEBE CONTENER AL MENOS 8 CARACTERES, UNA LETRA, UN NÚMERO Y UNA MAYÚSCULA.
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Campo: Confirmar contraseña */}
                            <div>
                                <InputLabel
                                    htmlFor="password_confirmation"
                                    value="Confirmar contraseña"
                                    className="text-sm font-semibold text-slate-700"
                                />
                                <div className="relative mt-1.5">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <TextInput
                                        id="password_confirmation"
                                        type={showConfirm ? 'text' : 'password'}
                                        value={data.password_confirmation}
                                        className="block w-full pl-11 pr-12 p-4 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all duration-200 shadow-inner"
                                        autoComplete="new-password"
                                        onChange={(event) => setData('password_confirmation', event.target.value)}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors duration-200"
                                    >
                                        {showConfirm ? (
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
                            </div>

                            {/* Botón de acción */}
                            <div className="pt-2">
                                <PrimaryButton
                                    disabled={processing}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl p-4 shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transform hover:-translate-y-0.5 transition-all duration-200 justify-center"
                                >
                                    {processing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Actualizando...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2 text-base">
                                            Actualizar contraseña
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