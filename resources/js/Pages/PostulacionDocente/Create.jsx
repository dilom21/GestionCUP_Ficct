import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, useRef, useCallback, useEffect } from 'react';

export default function Create({ requisitos, materias }) {
    const { flash } = usePage().props;
    const [mostrarExito, setMostrarExito] = useState(false);
    const [documentosList, setDocumentosList] = useState([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        nombre: '',
        apellido: '',
        correo: '',
        telefono: '',
        ci: '',
        profesion: '',
        grado_academico: '',
        experiencia_anios: '',
        disponibilidad_horaria: '',
        materias: [],
        documentos: [],
    });

    useEffect(() => {
        if (flash && flash.success) {
            setMostrarExito(true);
            setDocumentosList([]);
            reset();
        }
    }, [flash]);

    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);
    const dropRef = useRef(null);

    const EXT_PERMITIDAS = ['.pdf', '.doc', '.docx'];
    const MAX_SIZE = 20 * 1024 * 1024;

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const validarArchivo = (archivo) => {
        if (!EXT_PERMITIDAS.some(ext => archivo.name.toLowerCase().endsWith(ext))) return 'Solo se aceptan archivos PDF, DOC y DOCX.';
        if (archivo.size > MAX_SIZE) return 'El archivo supera el tamaño máximo de 20 MB.';
        return null;
    };

    const agregarArchivos = useCallback((archivos) => {
        const nuevos = [];
        const errores = [];
        Array.from(archivos).forEach((archivo) => {
            const error = validarArchivo(archivo);
            if (error) errores.push(`${archivo.name}: ${error}`);
            else nuevos.push(archivo);
        });
        if (errores.length > 0) alert(errores.join('\n'));
        if (nuevos.length > 0) {
            const actualizados = [...documentosList, ...nuevos];
            setDocumentosList(actualizados);
            setData('documentos', actualizados);
        }
    }, [documentosList, setData]);

    const eliminarArchivo = (index) => {
        const actualizados = documentosList.filter((_, i) => i !== index);
        setDocumentosList(actualizados);
        setData('documentos', actualizados);
    };

    const handleDrag = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) agregarArchivos(e.dataTransfer.files);
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) agregarArchivos(e.target.files);
    };

    const toggleMateria = (id) => {
        const actual = data.materias;
        if (actual.includes(id)) setData('materias', actual.filter((m) => m !== id));
        else setData('materias', [...actual, id]);
    };

    const submit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('nombre', data.nombre);
        formData.append('apellido', data.apellido);
        formData.append('correo', data.correo);
        formData.append('telefono', data.telefono || '');
        formData.append('ci', data.ci);
        formData.append('profesion', data.profesion);
        formData.append('grado_academico', data.grado_academico);
        formData.append('experiencia_anios', data.experiencia_anios);
        formData.append('disponibilidad_horaria', data.disponibilidad_horaria);
        data.materias.forEach((id, idx) => formData.append(`materias[${idx}]`, id));
        documentosList.forEach((archivo, idx) => formData.append(`documentos[${idx}]`, archivo));
        post('/postulacion-docente', { data: formData, preserveScroll: true });
    };

    if (mostrarExito) {
        return (
            <>
                <Head title="Postulación enviada" />
                <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
                    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 max-w-lg w-full border border-slate-100 p-10 text-center">
                        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-3">Postulación registrada correctamente</h2>
                        <p className="text-slate-500 leading-relaxed mb-2">Hemos recibido su solicitud.</p>
                        <p className="text-slate-500 leading-relaxed mb-2">Recibirá un correo electrónico con el seguimiento de su postulación.</p>
                        <p className="text-slate-400 text-sm mb-8">Si no encuentra el correo, revise también Spam o Correo no deseado.</p>
                        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Postulación Docente" />
            <div className="min-h-screen bg-slate-50">
                <div className="bg-gradient-to-r from-[#0B2046] via-[#122D5C] to-[#1E62A0]">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                    <img src="/imagenes/Logo-Ficct.png" alt="Logo FICCT" className="w-8 h-8 object-contain" />
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-white block leading-tight">FICCT</span>
                                    <span className="text-[10px] text-blue-300 font-medium">Curso Preuniversitario</span>
                                </div>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/10">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-semibold text-blue-200 uppercase tracking-wider">Postulación abierta</span>
                            </div>
                        </div>
                        <div className="pb-10 sm:pb-14">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">Postulación Docente</h1>
                            <p className="text-base sm:text-lg text-blue-200/90 mt-2 max-w-2xl">CUP FICCT — Complete el formulario para registrar su postulación.</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                    <div className="mt-8">
                        <div className="lg:grid lg:grid-cols-5 lg:gap-8">
                            <div className="lg:col-span-3 space-y-6">
                                <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
                                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <p className="text-sm text-blue-800 leading-relaxed">Los documentos serán revisados por el personal administrativo. Recibirá notificaciones por correo electrónico.</p>
                                </div>

                                <form onSubmit={submit} className="space-y-6">
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                                            <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center text-xs font-bold">1</div>
                                            <h2 className="text-base font-bold text-slate-800">Datos personales</h2>
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre <span className="text-red-500">*</span></label>
                                                <input type="text" value={data.nombre} onChange={(e) => setData('nombre', e.target.value)} placeholder="Ej: Juan"
                                                    className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all ${errors.nombre ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-600'}`} />
                                                {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1">Apellido <span className="text-red-500">*</span></label>
                                                <input type="text" value={data.apellido} onChange={(e) => setData('apellido', e.target.value)} placeholder="Ej: Pérez"
                                                    className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all ${errors.apellido ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-600'}`} />
                                                {errors.apellido && <p className="mt-1 text-xs text-red-500">{errors.apellido}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1">Correo electrónico <span className="text-red-500">*</span></label>
                                                <input type="email" value={data.correo} onChange={(e) => setData('correo', e.target.value)} placeholder="ejemplo@correo.com"
                                                    className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all ${errors.correo ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-600'}`} />
                                                {errors.correo && <p className="mt-1 text-xs text-red-500">{errors.correo}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1">Teléfono</label>
                                                <input type="text" value={data.telefono} onChange={(e) => setData('telefono', e.target.value)} placeholder="Ej: 70000000"
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-semibold text-slate-700 mb-1">Cédula de Identidad <span className="text-red-500">*</span></label>
                                                <input type="text" value={data.ci} onChange={(e) => setData('ci', e.target.value)} placeholder="Ej: 1234567"
                                                    className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all ${errors.ci ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-600'}`} />
                                                {errors.ci && <p className="mt-1 text-xs text-red-500">{errors.ci}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                                            <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center text-xs font-bold">2</div>
                                            <h2 className="text-base font-bold text-slate-800">Información profesional</h2>
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1">Profesión <span className="text-red-500">*</span></label>
                                                <input type="text" value={data.profesion} onChange={(e) => setData('profesion', e.target.value)} placeholder="Ej: Ingeniero Informático"
                                                    className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all ${errors.profesion ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-600'}`} />
                                                {errors.profesion && <p className="mt-1 text-xs text-red-500">{errors.profesion}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1">Grado académico <span className="text-red-500">*</span></label>
                                                <select value={data.grado_academico} onChange={(e) => setData('grado_academico', e.target.value)}
                                                    className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all ${errors.grado_academico ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-600'}`}>
                                                    <option value="">Seleccione...</option>
                                                    <option value="Técnico Superior">Técnico Superior</option>
                                                    <option value="Licenciatura">Licenciatura</option>
                                                    <option value="Diplomado">Diplomado</option>
                                                    <option value="Especialidad">Especialidad</option>
                                                    <option value="Maestría">Maestría</option>
                                                    <option value="Doctorado">Doctorado</option>
                                                    <option value="Postdoctorado">Postdoctorado</option>
                                                </select>
                                                {errors.grado_academico && <p className="mt-1 text-xs text-red-500">{errors.grado_academico}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1">Años de experiencia <span className="text-red-500">*</span></label>
                                                <input type="number" min="0" value={data.experiencia_anios} onChange={(e) => setData('experiencia_anios', e.target.value)} placeholder="0"
                                                    className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all ${errors.experiencia_anios ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-600'}`} />
                                                {errors.experiencia_anios && <p className="mt-1 text-xs text-red-500">{errors.experiencia_anios}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-1">Disponibilidad horaria <span className="text-red-500">*</span></label>
                                                <input type="text" value={data.disponibilidad_horaria} onChange={(e) => setData('disponibilidad_horaria', e.target.value)} placeholder="Ej: L-V 8:00-12:00"
                                                    className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all ${errors.disponibilidad_horaria ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-blue-600'}`} />
                                                {errors.disponibilidad_horaria && <p className="mt-1 text-xs text-red-500">{errors.disponibilidad_horaria}</p>}
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Materias a las que postula <span className="text-red-500">*</span></label>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    {materias.map((materia) => (
                                                        <label key={materia.id_materia}
                                                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all text-sm ${data.materias.includes(materia.id_materia) ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-slate-50 border-slate-200 hover:border-blue-200 hover:bg-white'}`}>
                                                            <input type="checkbox" checked={data.materias.includes(materia.id_materia)} onChange={() => toggleMateria(materia.id_materia)} className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-600/30 cursor-pointer" />
                                                            <span className={`font-medium ${data.materias.includes(materia.id_materia) ? 'text-blue-700' : 'text-slate-700'}`}>{materia.nombre}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                                {errors.materias && <p className="mt-1 text-xs text-red-500">{errors.materias}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button type="submit" disabled={processing}
                                            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-base rounded-2xl shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg flex items-center justify-center gap-2">
                                            {processing ? (
                                                <><svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg> Enviando postulación...</>
                                            ) : (
                                                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Enviar Postulación</>
                                            )}
                                        </button>
                                    </div>
                                </form>

                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <h2 className="text-base font-bold text-slate-800 mb-4">Preguntas Frecuentes</h2>
                                    <div className="space-y-2">
                                        {[
                                            { p: '¿Cómo conoceré el estado de mi postulación?', r: 'Recibirá una notificación por correo electrónico cada vez que su postulación cambie de estado.' },
                                            { p: '¿Qué documentos puedo adjuntar?', r: 'Se permiten archivos PDF, DOC y DOCX.' },
                                            { p: '¿Qué pasa si no recibo correos?', r: 'Revise la carpeta Spam o Correo no deseado.' },
                                        ].map((faq, idx) => (
                                            <details key={idx} className="group">
                                                <summary className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 cursor-pointer list-none hover:bg-slate-50 transition-colors">
                                                    <span className="text-sm font-medium text-slate-700 pr-4">{faq.p}</span>
                                                    <svg className="w-3.5 h-3.5 text-slate-400 transition-transform duration-200 group-open:rotate-180 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                </summary>
                                                <div className="px-4 pt-2 pb-3">
                                                    <p className="text-sm text-slate-500 leading-relaxed">{faq.r}</p>
                                                </div>
                                            </details>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-2 mt-6 lg:mt-0 space-y-6">
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
                                    <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        Documentación requerida
                                    </h2>
                                    <div ref={dropRef} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => inputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${dragActive ? 'border-blue-400 bg-blue-50/60' : 'border-slate-300 hover:border-blue-300 hover:bg-slate-50/60'}`}>
                                        <input ref={inputRef} type="file" multiple accept=".pdf,.doc,.docx" onChange={handleFileSelect} className="hidden" />
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                                            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                        </div>
                                        <p className="text-sm font-medium text-slate-700 mb-1">Arrastra o <span className="text-blue-600">selecciona</span></p>
                                        <p className="text-xs text-slate-400">PDF, DOC y DOCX — Máx 20 MB</p>
                                    </div>
                                    {errors.documentos && <p className="mt-2 text-xs text-red-500">{errors.documentos}</p>}
                                    {documentosList.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            {documentosList.map((archivo, idx) => (
                                                <div key={idx} className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-slate-700 truncate">{archivo.name}</p>
                                                        <p className="text-xs text-slate-400">{formatBytes(archivo.size)}</p>
                                                    </div>
                                                    <button type="button" onClick={() => eliminarArchivo(idx)} className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {requisitos && requisitos.length > 0 && (
                                        <div className="mt-6 pt-5 border-t border-slate-100">
                                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Requisitos</h3>
                                            <div className="space-y-2">
                                                {requisitos.map((req) => (
                                                    <div key={req.id} className="flex items-start gap-2.5">
                                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                                                            <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-700">{req.nombre}</p>
                                                            {req.descripcion && <p className="text-xs text-slate-400">{req.descripcion}</p>}
                                                            {req.obligatorio && (
                                                                <span className="inline-block mt-0.5 text-[9px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">Obligatorio</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="bg-slate-900 text-white py-6">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} FICCT — UAGRM. Facultad de Ciencias de la Computación y Telecomunicaciones.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}