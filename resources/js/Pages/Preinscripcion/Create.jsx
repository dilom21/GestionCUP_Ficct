import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState, useRef, useCallback, useEffect } from 'react';
import PasarelaPago from '@/Pages/Financiero/PasarelaPago';

export default function PreinscripcionCreate({ carreras, requisitos, paymentData, paymentSuccess }) {
    const { flash } = usePage().props;
    const [paso, setPaso] = useState(paymentData ? 2 : 0);
    const [documentosList, setDocumentosList] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [postulacionId, setPostulacionId] = useState(null);
    const [erroresPasoUno, setErroresPasoUno] = useState({});
    const inputRef = useRef(null);
    const dropRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        nombre: '', apellidos: '', correo: '', telefono: '', ci: '',
        fecha_nacimiento: '', sexo: '', direccion: '', colegio_procedencia: '',
        ciudad: '', turno: '', id_carrera_opcion_1: '', id_carrera_opcion_2: '',
        documentos: [],
    });

    useEffect(() => {
        if (flash?.success && postulacionId) {
            router.visit(`/preinscripcion/${postulacionId}`);
        }
    }, [flash]);

    const EXT = ['.pdf', '.doc', '.docx'];
    const MAX_SIZE = 20 * 1024 * 1024;

    const formatBytes = (b) => {
        if (b === 0) return '0 Bytes';
        const k = 1024, sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(b) / Math.log(k));
        return parseFloat((b / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const validarArchivo = (a) => {
        if (!EXT.some(e => a.name.toLowerCase().endsWith(e))) return 'Solo PDF, DOC y DOCX.';
        if (a.size > MAX_SIZE) return 'Máximo 20 MB.';
        return null;
    };

    const agregarArchivos = useCallback((archivos) => {
        const nuevos = [], errores = [];
        Array.from(archivos).forEach((a) => {
            const e = validarArchivo(a);
            if (e) errores.push(`${a.name}: ${e}`);
            else nuevos.push(a);
        });
        if (errores.length) alert(errores.join('\n'));
        if (nuevos.length) {
            const act = [...documentosList, ...nuevos];
            setDocumentosList(act);
            setData('documentos', act);
        }
    }, [documentosList, setData]);

    const eliminarArchivo = (i) => {
        const act = documentosList.filter((_, idx) => idx !== i);
        setDocumentosList(act);
        setData('documentos', act);
    };

    const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true); else if (e.type === 'dragleave') setDragActive(false); };
    const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files && e.dataTransfer.files.length > 0) agregarArchivos(e.dataTransfer.files); };
    const handleFileSelect = (e) => { if (e.target.files && e.target.files.length > 0) agregarArchivos(e.target.files); };

    const validarPasoUno = () => {
        const nuevosErrores = {};
        const camposObligatorios = {
            nombre: 'El nombre es obligatorio.',
            apellidos: 'Los apellidos son obligatorios.',
            correo: 'El correo electrónico es obligatorio.',
            telefono: 'El teléfono es obligatorio.',
            ci: 'El CI es obligatorio.',
            fecha_nacimiento: 'La fecha de nacimiento es obligatoria.',
            sexo: 'El sexo es obligatorio.',
            ciudad: 'La ciudad es obligatoria.',
            turno: 'El turno es obligatorio.',
            direccion: 'La dirección es obligatoria.',
            colegio_procedencia: 'El colegio de procedencia es obligatorio.',
            id_carrera_opcion_1: 'La carrera opción 1 es obligatoria.',
            id_carrera_opcion_2: 'La carrera opción 2 es obligatoria.',
        };

        Object.entries(camposObligatorios).forEach(([campo, mensaje]) => {
            if (!String(data[campo] ?? '').trim()) nuevosErrores[campo] = mensaje;
        });

        if (data.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.correo)) {
            nuevosErrores.correo = 'Ingrese un correo electrónico válido.';
        }

        if (
            data.id_carrera_opcion_1 &&
            data.id_carrera_opcion_2 &&
            String(data.id_carrera_opcion_1) === String(data.id_carrera_opcion_2)
        ) {
            nuevosErrores.id_carrera_opcion_2 = 'Las dos carreras seleccionadas deben ser diferentes.';
        }

        setErroresPasoUno(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const avanzarARequisitos = () => {
        if (validarPasoUno()) {
            setPaso(1);
            return;
        }

        requestAnimationFrame(() => {
            document.querySelector('[data-error-paso-uno]')?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        });
    };

    const seleccionarCarreraUno = (valor) => {
        setData((actual) => ({
            ...actual,
            id_carrera_opcion_1: valor,
            id_carrera_opcion_2:
                String(actual.id_carrera_opcion_2) === String(valor)
                    ? ''
                    : actual.id_carrera_opcion_2,
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        if (documentosList.length === 0) {
            alert('Debe adjuntar al menos un documento.');
            return;
        }
        const fd = new FormData();
        fd.append('nombre', data.nombre);
        fd.append('apellidos', data.apellidos);
        fd.append('correo', data.correo);
        fd.append('telefono', data.telefono || '');
        fd.append('ci', data.ci);
        fd.append('fecha_nacimiento', data.fecha_nacimiento);
        fd.append('sexo', data.sexo);
        fd.append('direccion', data.direccion || '');
        fd.append('colegio_procedencia', data.colegio_procedencia || '');
        fd.append('ciudad', data.ciudad);
        fd.append('turno', data.turno);
        fd.append('id_carrera_opcion_1', data.id_carrera_opcion_1);
        fd.append('id_carrera_opcion_2', data.id_carrera_opcion_2);
        documentosList.forEach((a, i) => fd.append(`documentos[${i}]`, a));
        post('/preinscripcion', { data: fd, preserveScroll: true, onError: () => {} });
    };

    const pasos = [
        { num: 1, label: 'Datos del postulante' },
        { num: 2, label: 'Requisitos' },
        { num: 3, label: 'Pago' },
        { num: 4, label: 'Estado' },
    ];

    return (
        <>
            <Head title="Preinscripción - CUP FICCT" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0B2046] via-[#122D5C] to-[#1E62A0]">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-3">
                                <img src="/imagenes/Logo-Ficct.png" alt="Logo" className="w-10 h-10 object-contain" />
                                <div>
                                    <span className="text-sm font-bold text-white">FICCT</span>
                                    <span className="text-[10px] text-blue-300 block">Curso Preuniversitario</span>
                                </div>
                            </div>
                        </div>
                        <div className="pb-8 text-center">
                            <h1 className="text-3xl font-extrabold text-white">Preinscripción CUP FICCT</h1>
                            <p className="text-blue-200/90 mt-2">Completa los pasos para registrar tu postulación</p>
                        </div>
                    </div>
                </div>

                {/* Stepper */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
                        <div className="flex items-center justify-between">
                            {pasos.map((p, i) => (
                                <div key={i} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${paymentSuccess ? (i < 3 ? 'bg-emerald-500 text-white shadow-md' : 'bg-emerald-500 text-white shadow-md') : paymentData ? (i < 2 ? 'bg-emerald-500 text-white shadow-md' : i === 2 ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-200 text-slate-400') : (paso >= i ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-200 text-slate-400')}`}>
                                            {paymentSuccess ? (i < 3 ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                            )) : paymentData ? (i < 2 ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                            ) : p.num) : (paso > i ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                            ) : p.num)}
                                        </div>
                                        <span className={`text-[10px] mt-1.5 font-medium text-center ${paymentSuccess ? 'text-emerald-700 font-semibold' : paymentData ? (i < 2 ? 'text-emerald-700' : i === 2 ? 'text-emerald-700 font-semibold' : 'text-slate-400') : (paso >= i ? 'text-emerald-700' : 'text-slate-400')}`}>{p.label}</span>
                                    </div>
                                    {i < pasos.length - 1 && (
                                        <div className={`flex-1 h-0.5 mx-3 mt-[-1.5rem] ${paymentSuccess ? 'bg-emerald-400' : paymentData ? (i < 2 ? 'bg-emerald-400' : 'bg-slate-200') : (paso > i ? 'bg-emerald-400' : 'bg-slate-200')}`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {paymentSuccess ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 p-10 text-center">
                            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                ¡Bienvenido a la FICCT, {paymentSuccess.nombre || 'Postulante'}!
                            </h2>
                            <p className="text-slate-500 max-w-lg mx-auto leading-relaxed mb-6">
                                Tu pago ha sido procesado con éxito y tu inscripción al <strong>Curso Preuniversitario FICCT</strong> está completa.
                            </p>
                            <div className="inline-flex items-center gap-4 bg-emerald-50 rounded-xl border border-emerald-200 px-6 py-4 text-sm mb-6">
                                <span className="text-slate-500">Nro. Formulario:</span>
                                <span className="font-mono font-bold text-slate-800">{paymentSuccess.nro_formulario}</span>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-lg mx-auto">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-semibold text-blue-800 mb-1">Revisa tu correo electrónico</p>
                                        <p className="text-sm text-blue-600 leading-relaxed">
                                            Hemos enviado tus credenciales de acceso al sistema al correo que registraste en la preinscripción.
                                            Con ellas podrás iniciar sesión y acceder a todos los servicios del Curso Preuniversitario.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8">
                                <a href="/login"
                                    className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/30">
                                    Ir al inicio de sesión
                                </a>
                            </div>
                        </div>
                    ) : paymentData ? (
                        <>
                            {/* Información del postulante */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center mb-8">
                                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                    Hola, {paymentData.nombre || 'Postulante'}
                                </h2>
                                <p className="text-slate-500 mb-2">
                                    Estás realizando el pago del <strong>Curso Preuniversitario FICCT</strong>
                                </p>
                                <div className="inline-flex items-center gap-4 mt-2 bg-slate-50 rounded-xl border border-slate-200 px-5 py-3 text-sm">
                                    <span className="text-slate-500">Nro. Formulario:</span>
                                    <span className="font-mono font-bold text-slate-800">{paymentData.nro_formulario}</span>
                                </div>
                                <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-400">
                                    <span>Opción 1: <strong className="text-slate-600">{paymentData.carrera1 || '—'}</strong></span>
                                    <span>Opción 2: <strong className="text-slate-600">{paymentData.carrera2 || '—'}</strong></span>
                                </div>
                            </div>

                            {/* Paso 3: Pago */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                                <PasarelaPago
                                    id_postulacion={paymentData.id}
                                    token={paymentData.token}
                                    autoStart={false}
                                />
                            </div>
                        </>
                    ) : (
                        <form onSubmit={submit}>
                            {/* Paso 1: Datos del postulante */}
                            {paso === 0 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-5">
                                    <h2 className="text-lg font-bold text-slate-800">Datos del postulante</h2>
                                    {Object.keys(erroresPasoUno).length > 0 && (
                                        <div
                                            data-error-paso-uno
                                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                                        >
                                            Completa correctamente todos los campos antes de continuar.
                                        </div>
                                    )}
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre *</label>
                                            <input type="text" value={data.nombre} onChange={(e) => setData('nombre', e.target.value)}
                                                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 ${errors.nombre ? 'border-red-300' : 'border-slate-200 focus:border-blue-600'}`} />
                                            {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Apellidos *</label>
                                            <input type="text" value={data.apellidos} onChange={(e) => setData('apellidos', e.target.value)}
                                                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 ${errors.apellidos ? 'border-red-300' : 'border-slate-200 focus:border-blue-600'}`} />
                                            {errors.apellidos && <p className="mt-1 text-xs text-red-500">{errors.apellidos}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Correo electrónico *</label>
                                            <input type="email" value={data.correo} onChange={(e) => setData('correo', e.target.value)}
                                                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 ${errors.correo ? 'border-red-300' : 'border-slate-200 focus:border-blue-600'}`} />
                                            {errors.correo && <p className="mt-1 text-xs text-red-500">{errors.correo}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Teléfono *</label>
                                            <input type="text" value={data.telefono} onChange={(e) => setData('telefono', e.target.value)}
                                                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 ${erroresPasoUno.telefono ? 'border-red-300' : 'border-slate-200'}`} />
                                            {erroresPasoUno.telefono && <p className="mt-1 text-xs text-red-500">{erroresPasoUno.telefono}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">CI *</label>
                                            <input type="text" value={data.ci} onChange={(e) => setData('ci', e.target.value)}
                                                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 ${errors.ci ? 'border-red-300' : 'border-slate-200 focus:border-blue-600'}`} />
                                            {errors.ci && <p className="mt-1 text-xs text-red-500">{errors.ci}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha de nacimiento *</label>
                                            <input type="date" value={data.fecha_nacimiento} onChange={(e) => setData('fecha_nacimiento', e.target.value)}
                                                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 ${errors.fecha_nacimiento ? 'border-red-300' : 'border-slate-200 focus:border-blue-600'}`} />
                                            {errors.fecha_nacimiento && <p className="mt-1 text-xs text-red-500">{errors.fecha_nacimiento}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Sexo *</label>
                                            <select value={data.sexo} onChange={(e) => setData('sexo', e.target.value)}
                                                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 ${errors.sexo ? 'border-red-300' : 'border-slate-200 focus:border-blue-600'}`}>
                                                <option value="">Seleccionar...</option>
                                                <option value="M">Masculino</option>
                                                <option value="F">Femenino</option>
                                            </select>
                                            {errors.sexo && <p className="mt-1 text-xs text-red-500">{errors.sexo}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Ciudad *</label>
                                            <input type="text" value={data.ciudad} onChange={(e) => setData('ciudad', e.target.value)}
                                                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 ${errors.ciudad ? 'border-red-300' : 'border-slate-200 focus:border-blue-600'}`} />
                                            {errors.ciudad && <p className="mt-1 text-xs text-red-500">{errors.ciudad}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Turno *</label>
                                            <select value={data.turno} onChange={(e) => setData('turno', e.target.value)}
                                                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 ${errors.turno ? 'border-red-300' : 'border-slate-200 focus:border-blue-600'}`}>
                                                <option value="">Seleccionar...</option>
                                                <option value="Mañana">Mañana</option>
                                                <option value="Tarde">Tarde</option>
                                                <option value="Noche">Noche</option>
                                            </select>
                                            {errors.turno && <p className="mt-1 text-xs text-red-500">{errors.turno}</p>}
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Dirección *</label>
                                            <input type="text" value={data.direccion} onChange={(e) => setData('direccion', e.target.value)}
                                                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 ${erroresPasoUno.direccion ? 'border-red-300' : 'border-slate-200'}`} />
                                            {erroresPasoUno.direccion && <p className="mt-1 text-xs text-red-500">{erroresPasoUno.direccion}</p>}
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Colegio de procedencia *</label>
                                            <input type="text" value={data.colegio_procedencia} onChange={(e) => setData('colegio_procedencia', e.target.value)}
                                                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 ${erroresPasoUno.colegio_procedencia ? 'border-red-300' : 'border-slate-200'}`} />
                                            {erroresPasoUno.colegio_procedencia && <p className="mt-1 text-xs text-red-500">{erroresPasoUno.colegio_procedencia}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Carrera opción 1 *</label>
                                            <select value={data.id_carrera_opcion_1} onChange={(e) => seleccionarCarreraUno(e.target.value)}
                                                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 ${(errors.id_carrera_opcion_1 || erroresPasoUno.id_carrera_opcion_1) ? 'border-red-300' : 'border-slate-200 focus:border-blue-600'}`}>
                                                <option value="">Seleccionar...</option>
                                                {carreras.map((c) => <option key={c.id} value={c.id} disabled={String(c.id) === String(data.id_carrera_opcion_2)}>{c.nombre} ({c.sigla})</option>)}
                                            </select>
                                            {(errors.id_carrera_opcion_1 || erroresPasoUno.id_carrera_opcion_1) && <p className="mt-1 text-xs text-red-500">{errors.id_carrera_opcion_1 || erroresPasoUno.id_carrera_opcion_1}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Carrera opción 2 *</label>
                                            <select value={data.id_carrera_opcion_2} onChange={(e) => setData('id_carrera_opcion_2', e.target.value)}
                                                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 ${(errors.id_carrera_opcion_2 || erroresPasoUno.id_carrera_opcion_2) ? 'border-red-300' : 'border-slate-200 focus:border-blue-600'}`}>
                                                <option value="">Seleccionar...</option>
                                                {carreras.map((c) => <option key={c.id} value={c.id} disabled={String(c.id) === String(data.id_carrera_opcion_1)}>{c.nombre} ({c.sigla})</option>)}
                                            </select>
                                            {(errors.id_carrera_opcion_2 || erroresPasoUno.id_carrera_opcion_2) && <p className="mt-1 text-xs text-red-500">{errors.id_carrera_opcion_2 || erroresPasoUno.id_carrera_opcion_2}</p>}
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button type="button" onClick={avanzarARequisitos}
                                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all">Siguiente</button>
                                    </div>
                                </div>
                            )}

                            {/* Paso 2: Requisitos */}
                            {paso === 1 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-5">
                                    <h2 className="text-lg font-bold text-slate-800">Requisitos</h2>
                                    {requisitos && requisitos.length > 0 && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                                            <p className="text-sm font-medium text-amber-800 mb-2">Documentos requeridos:</p>
                                            <ul className="text-xs text-amber-700 space-y-1">
                                                {requisitos.filter(r => r.obligatorio).map((r) => (
                                                    <li key={r.id} className="flex items-center gap-2">
                                                        <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        {r.nombre} {r.descripcion && <span className="text-amber-500">— {r.descripcion}</span>}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    <div ref={dropRef} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => inputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${dragActive ? 'border-blue-400 bg-blue-50/60' : 'border-slate-300 hover:border-blue-300'}`}>
                                        <input ref={inputRef} type="file" multiple accept=".pdf,.doc,.docx" onChange={handleFileSelect} className="hidden" />
                                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                        </div>
                                        <p className="text-sm font-medium text-slate-700 mb-1">Arrastra o <span className="text-blue-600">selecciona</span> tus documentos</p>
                                        <p className="text-xs text-slate-400">PDF, DOC y DOCX — Máx 20 MB</p>
                                    </div>
                                    {errors.documentos && <p className="text-xs text-red-500">{errors.documentos}</p>}
                                    {documentosList.length > 0 && (
                                        <div className="space-y-2">
                                            {documentosList.map((a, i) => (
                                                <div key={i} className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                                                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-slate-700 truncate">{a.name}</p>
                                                        <p className="text-xs text-slate-400">{formatBytes(a.size)}</p>
                                                    </div>
                                                    <button type="button" onClick={() => eliminarArchivo(i)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex justify-between pt-4">
                                        <button type="button" onClick={() => setPaso(0)} className="px-6 py-3 border border-slate-300 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">Anterior</button>
                                        <button type="submit" disabled={processing}
                                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                            {processing ? (
                                                <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg> Enviando...</>
                                            ) : 'Enviar Postulación'}
                                        </button>
                                    </div>
                                </div>
                            )}
                            {/* Paso 3: Pago (después de enviar) */}
                            {paso === 2 && !paymentData && (
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center">
                                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-3">Pago pendiente</h3>
                                    <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                                        Una vez que el administrador revise y apruebe tus documentos, recibirás un correo electrónico con el enlace para realizar el pago.
                                    </p>
                                </div>
                            )}

                            {/* Paso 4: Estado (después de enviar) */}
                            {paso === 3 && !paymentData && (
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-3">Estado de la postulación</h3>
                                    <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                                        Podrás hacer seguimiento del estado de tu postulación a través de las notificaciones que lleguen a tu correo electrónico.
                                    </p>
                                </div>
                            )}
                        </form>
                    )}
                </div>

                <footer className="bg-slate-900 text-white py-6 mt-16">
                    <div className="max-w-5xl mx-auto px-4 text-center">
                        <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} FICCT — UAGRM</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
