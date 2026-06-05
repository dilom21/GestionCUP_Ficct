import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

// ─── Sección Navbar ───────────────────────────────────────────────
function Navbar({ gestion }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLinks = [
        { label: 'Inicio', href: '#hero' },
        { label: 'Carreras', href: '#carreras' },
        { label: 'Requisitos', href: '#requisitos' },
        { label: 'Cronograma', href: '#cronograma' },
        { label: 'Preguntas Frecuentes', href: '#faq' },
        { label: 'Contacto', href: '#contacto' },
    ];
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo + nombre */}
                    <a href="#hero" className="flex items-center gap-3 group">
                        <img
                            src="/Imagenes/Logo-Ficct.png"
                            alt="Logo FICCT"
                            className="h-10 w-10 lg:h-12 lg:w-12 object-contain transition-transform group-hover:scale-105"
                        />
                        <div className="hidden sm:block">
                            <span className="text-base lg:text-lg font-bold text-[#0B2046] leading-tight block">
                                FICCT
                            </span>
                            <span className="text-[10px] lg:text-xs text-[#1E62A0] font-medium leading-tight block">
                                {gestion}
                            </span>
                        </div>
                    </a>

                    {/* Desktop links */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#1E62A0] rounded-lg hover:bg-blue-50 transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* Desktop actions */}
                    <div className="hidden lg:flex items-center gap-3">
                        <a
                        href="/login"
                        className="text-xs font-medium text-gray-500 hover:text-[#1E62A0] transition-colors"
                    >
                        Acceso institucional
                    </a>
                        <a
                            href="#carreras"
                            className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#0B2046] to-[#1E62A0] rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                        >
                            Preinscribirme
                        </a>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {mobileOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="lg:hidden bg-white border-t border-gray-100">
                    <div className="px-4 py-3 space-y-1">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-[#1E62A0] hover:bg-blue-50 rounded-lg transition-colors"
                            >
                                {link.label}
                            </a>
                        ))}
                        <hr className="my-2 border-gray-200" />
                        <a
                        href="/login"
                        className="block px-3 py-2.5 text-sm font-medium text-gray-500 hover:text-[#1E62A0] rounded-lg transition-colors"
                    >
                        Acceso institucional
                    </a>
                        <a
                            href="#carreras"
                            onClick={() => setMobileOpen(false)}
                            className="block text-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#0B2046] to-[#1E62A0] rounded-full mt-2"
                        >
                            Preinscribirme
                        </a>
                    </div>
                </div>
            )}
        </nav>
    );
}

// ─── Sección Hero ─────────────────────────────────────────────────
function Hero({ gestion }) {
    return (
        <section id="hero" className="relative min-h-screen flex items-center pt-20 lg:pt-24 overflow-hidden bg-gradient-to-br from-[#0B2046] via-[#122D5C] to-[#1E62A0]">
            {/* Elementos decorativos de fondo */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-blue-300/5 rounded-full blur-3xl"></div>
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
            </div>

            <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
                    {/* Texto */}
                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 mb-6">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            <span className="text-xs font-medium text-blue-200 tracking-wide uppercase">{gestion}</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-tight mb-4">
                            Curso Preuniversitario
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300 mt-2">
                                FICCT
                            </span>
                        </h1>

                        <p className="text-base sm:text-lg lg:text-xl text-blue-200/90 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                            Tu ingreso a las Ingenierías de la Facultad de Ciencias de la Computación y Telecomunicaciones
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                            <a
                                href="#carreras"
                                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-[#1E62A0] to-[#2E86C1] rounded-full hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300"
                            >
                                Preinscribirme
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </a>
                            <a
                                href="#requisitos"
                                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold text-white border-2 border-white/30 rounded-full hover:bg-white/10 hover:border-white/50 transition-all duration-300"
                            >
                                Ver requisitos
                            </a>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-6 mt-10 justify-center lg:justify-start">
                            {[
                                { number: '4', label: 'Carreras' },
                                { number: '100%', label: 'Modalidad Presencial' },
                                { number: '6', label: 'Meses de duración' },
                            ].map((stat) => (
                                <div key={stat.label} className="text-center">
                                    <div className="text-2xl lg:text-3xl font-bold text-white">{stat.number}</div>
                                    <div className="text-xs text-blue-300/80 mt-0.5">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Logo a la derecha */}
                    <div className="flex-shrink-0">
                        <div className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-80 lg:h-80">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl"></div>
                            <img
                                src="/Imagenes/Logo-Ficct.png"
                                alt="Logo FICCT"
                                className="relative w-full h-full object-contain drop-shadow-2xl animate-float"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Wave divider */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                    <path d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z" fill="#F8FAFC" />
                </svg>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
            `}</style>
        </section>
    );
}

// ─── Sección Carreras ──────────────────────────────────────────────
const carrerasData = [
    {
        slug: 'informatica',
        nombre: 'Ingeniería Informática',
        descripcion: 'Forma profesionales en desarrollo de software, inteligencia artificial, bases de datos y gestión de tecnologías de información para impulsar la transformación digital.',
        logo: '/Imagenes/Carreras/Informatica.png',
        malla: '/Imagenes/Mallas/Informatica.png',
        color: 'from-blue-600 to-blue-800',
    },
    {
        slug: 'sistemas',
        nombre: 'Ingeniería en Sistemas',
        descripcion: 'Capacita en diseño, implementación y administración de sistemas informáticos complejos, redes corporativas y soluciones tecnológicas integrales.',
        logo: '/Imagenes/Carreras/Sistemas.png',
        malla: '/Imagenes/Mallas/Sistemas.png',
        color: 'from-cyan-600 to-blue-700',
    },
    {
        slug: 'redes',
        nombre: 'Ingeniería en Redes y Telecomunicaciones',
        descripcion: 'Prepara especialistas en infraestructura de redes, comunicaciones, seguridad informática y tecnologías de telecomunicación de última generación.',
        logo: '/Imagenes/Carreras/Redes.png',
        malla: '/Imagenes/Mallas/Redes.png',
        color: 'from-blue-700 to-indigo-800',
    },
    {
        slug: 'robotica',
        nombre: 'Ingeniería en Robótica',
        descripcion: 'Forma ingenieros en automatización, robótica industrial, sistemas embebidos, IoT y control de procesos productivos con visión tecnológica.',
        logo: '/Imagenes/Carreras/Robotica.png',
        malla: '/Imagenes/Mallas/Robotica.png',
        color: 'from-indigo-600 to-blue-800',
    },
];

function Carreras() {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedMalla, setSelectedMalla] = useState('');

    const openMalla = (mallaUrl) => {
        setSelectedMalla(mallaUrl);
        setModalOpen(true);
    };

    return (
        <section id="carreras" className="relative py-20 lg:py-28 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Encabezado */}
                <div className="text-center mb-16">
                    <span className="inline-block text-xs font-semibold text-[#1E62A0] bg-blue-50 px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
                        Oferta Académica
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B2046]">
                        Carreras Disponibles
                    </h2>
                    <p className="mt-4 text-gray-500 max-w-2xl mx-auto text-base lg:text-lg">
                        Elige tu carrera y prepárate para un futuro lleno de oportunidades en el mundo de la tecnología
                    </p>
                </div>

                {/* Grid de tarjetas */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {carrerasData.map((carrera) => (
                        <div
                            key={carrera.slug}
                            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-2 flex flex-col"
                        >
                            {/* Imagen */}
                            <div className="relative h-48 bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-8">
                                <div className={`absolute inset-0 bg-gradient-to-br ${carrera.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                                <img
                                    src={carrera.logo}
                                    alt={carrera.nombre}
                                    className="h-28 w-auto object-contain transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>

                            {/* Contenido */}
                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="text-base font-bold text-[#0B2046] mb-2 group-hover:text-[#1E62A0] transition-colors">
                                    {carrera.nombre}
                                </h3>
                                <p className="text-sm text-gray-500 leading-relaxed flex-1 mb-4">
                                    {carrera.descripcion}
                                </p>
                                <button
                                    onClick={() => openMalla(carrera.malla)}
                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#1E62A0] bg-blue-50 hover:bg-[#1E62A0] hover:text-white rounded-xl transition-all duration-300"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Ver plan de estudios
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal para malla curricular */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
                    <div
                        className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <h3 className="text-lg font-bold text-[#0B2046]">Plan de Estudios</h3>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6">
                            <img
                                src={selectedMalla}
                                alt="Malla Curricular"
                                className="w-full h-auto rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

// ─── Sección Requisitos ────────────────────────────────────────────
const requisitosList = [
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        title: 'Título de Bachiller',
        desc: 'Original y fotocopia simple',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
            </svg>
        ),
        title: 'Cédula de Identidad',
        desc: 'Fotocopia simple',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
        ),
        title: 'Formulario de Preinscripción',
        desc: 'Completar y presentar',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        title: 'Recibo de Pago',
        desc: 'Comprobante de matrícula',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
        ),
        title: 'Folder Amarillo',
        desc: 'Para la presentación de documentos',
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        ),
        title: 'Estudiantes Antiguos',
        desc: 'Ratificar inscripción en la página',
    },
];

function Requisitos() {
    return (
        <section id="requisitos" className="relative py-20 lg:py-28 bg-gradient-to-br from-[#0B2046] via-[#122D5C] to-[#1E62A0] overflow-hidden">
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="inline-block text-xs font-semibold text-blue-300 bg-white/10 px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider border border-white/10">
                        Documentación
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                        Requisitos de Inscripción
                    </h2>
                    <p className="mt-4 text-blue-200/80 max-w-2xl mx-auto text-base lg:text-lg">
                        Asegúrate de contar con toda la documentación necesaria para tu preinscripción
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {requisitosList.map((req, idx) => (
                        <div
                            key={idx}
                            className="group bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center text-blue-300 group-hover:bg-white/25 group-hover:text-white transition-all">
                                    {req.icon}
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">{req.title}</h3>
                                    <p className="text-xs text-blue-200/70 mt-1">{req.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Sección Costos ────────────────────────────────────────────────
const costosData = [
    {
        tipo: 'Colegio Fiscal o Convenio',
        precio: '300 Bs',
        desc: 'Para estudiantes provenientes de unidades educativas fiscales o con convenio.',
        destacado: false,
    },
    {
        tipo: 'Colegio Particular',
        precio: '500 Bs',
        desc: 'Para estudiantes de colegios particulares a nivel nacional.',
        destacado: true,
    },
    {
        tipo: 'Extranjero',
        precio: '600 Bs',
        desc: 'Para postulantes de nacionalidad extranjera.',
        destacado: false,
    },
];

function Costos() {
    return (
        <section id="costos" className="relative py-20 lg:py-28 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="inline-block text-xs font-semibold text-[#1E62A0] bg-blue-50 px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
                        Inversión
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B2046]">
                        Costos de Matrícula
                    </h2>
                    <p className="mt-4 text-gray-500 max-w-2xl mx-auto text-base lg:text-lg">
                        Elige la categoría que corresponda según tu procedencia escolar
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
                    {costosData.map((costo, idx) => (
                        <div
                            key={idx}
                            className={`relative rounded-2xl p-6 lg:p-8 transition-all duration-300 hover:-translate-y-2 ${
                                costo.destacado
                                    ? 'bg-gradient-to-br from-[#0B2046] to-[#1E62A0] text-white shadow-xl shadow-blue-500/20 scale-105'
                                    : 'bg-white border border-gray-200 text-gray-900 shadow-sm hover:shadow-lg'
                            }`}
                        >
                            {costo.destacado && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-[#0B2046] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    Más popular
                                </div>
                            )}
                            <div className="text-center">
                                <h3 className={`text-sm font-semibold mb-1 ${costo.destacado ? 'text-blue-200' : 'text-gray-500'}`}>
                                    {costo.tipo}
                                </h3>
                                <div className={`text-4xl lg:text-5xl font-extrabold my-4 ${costo.destacado ? 'text-white' : 'text-[#0B2046]'}`}>
                                    {costo.precio}
                                </div>
                                <p className={`text-sm ${costo.destacado ? 'text-blue-200/80' : 'text-gray-400'}`}>
                                    {costo.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Sección Cronograma ────────────────────────────────────────────
const eventos = [
    {
        fecha: 'Enero 2026',
        fechaCorta: '15',
        mes: 'ENE',
        titulo: 'Inicio de Preinscripción',
        desc: 'Apertura del sistema de preinscripción para la Gestión 1 - 2026.',
        color: 'bg-blue-500',
    },
    {
        fecha: 'Febrero 2026',
        fechaCorta: '28',
        mes: 'FEB',
        titulo: 'Fin de Preinscripción',
        desc: 'Cierre del periodo de preinscripción y recepción de formularios.',
        color: 'bg-red-500',
    },
    {
        fecha: 'Marzo 2026',
        fechaCorta: '15',
        mes: 'MAR',
        titulo: 'Entrega de Documentos',
        desc: 'Fecha límite para la entrega de documentación en secretaría.',
        color: 'bg-amber-500',
    },
    {
        fecha: 'Abril 2026',
        fechaCorta: '01',
        mes: 'ABR',
        titulo: 'Inicio de Clases',
        desc: 'Inicio oficial del Curso Preuniversitario FICCT.',
        color: 'bg-green-500',
    },
];

function Cronograma() {
    return (
        <section id="cronograma" className="relative py-20 lg:py-28 bg-gradient-to-br from-[#0B2046] via-[#122D5C] to-[#1E62A0] overflow-hidden">
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 75% 75%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="inline-block text-xs font-semibold text-blue-300 bg-white/10 px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider border border-white/10">
                        Calendario
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                        Cronograma
                    </h2>
                    <p className="mt-4 text-blue-200/80 max-w-2xl mx-auto text-base lg:text-lg">
                        Fechas importantes del proceso de preinscripción y curso
                    </p>
                </div>

                <div className="relative max-w-4xl mx-auto">
                    {/* Línea temporal */}
                    <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/10 -translate-x-1/2"></div>

                    <div className="space-y-8 lg:space-y-12">
                        {eventos.map((evento, idx) => (
                            <div key={idx} className={`flex flex-col lg:flex-row items-center gap-6 ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                                {/* Tarjeta */}
                                <div className={`flex-1 ${idx % 2 === 0 ? 'lg:text-right lg:pr-12' : 'lg:text-left lg:pl-12'}`}>
                                    <div className={`bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-5 lg:p-6 inline-block w-full ${idx % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                                        <h3 className="text-base font-bold text-white mb-1">{evento.titulo}</h3>
                                        <p className="text-sm text-blue-200/70">{evento.desc}</p>
                                    </div>
                                </div>

                                {/* Fecha circular */}
                                <div className="flex-shrink-0 relative z-10">
                                    <div className={`w-16 h-16 rounded-full flex flex-col items-center justify-center text-white shadow-lg ${evento.color}`}>
                                        <span className="text-lg font-bold leading-none">{evento.fechaCorta}</span>
                                        <span className="text-[10px] font-semibold uppercase leading-none mt-0.5">{evento.mes}</span>
                                    </div>
                                </div>

                                {/* Espacio */}
                                <div className="flex-1 hidden lg:block"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Wave divider */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full rotate-180">
                    <path d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z" fill="#F8FAFC" />
                </svg>
            </div>
        </section>
    );
}

// ─── Sección FAQ ───────────────────────────────────────────────────
const faqs = [
    {
        pregunta: '¿Necesito cuenta para preinscribirme?',
        respuesta: 'No. El postulante nuevo no inicia sesión para preinscribirse. Solo debes completar el formulario de preinscripción con tus datos personales y académicos.',
    },
    {
        pregunta: '¿Cuándo puedo iniciar sesión?',
        respuesta: 'Cuando el sistema habilite la cuenta del postulante después de validar requisitos y pago. Recibirás un correo con tus credenciales de acceso.',
    },
    {
        pregunta: '¿Qué carreras puedo elegir?',
        respuesta: 'Puede elegir primera y segunda opción entre las carreras disponibles: Ingeniería Informática, Ingeniería en Sistemas, Ingeniería en Redes y Telecomunicaciones, e Ingeniería en Robótica.',
    },
    {
        pregunta: '¿Qué pasa después de habilitarme?',
        respuesta: 'Podrá acceder al portal para consultar grupo, horario, resultados del CUP y admisión. También podrás ver tu estado académico y descargar certificados.',
    },
    {
        pregunta: '¿El curso preuniversitario es presencial?',
        respuesta: 'Sí, el Curso Preuniversitario FICCT se dicta en modalidad presencial en las instalaciones de la facultad, con horarios establecidos por la dirección académica.',
    },
    {
        pregunta: '¿Cuánto dura el curso preuniversitario?',
        respuesta: 'El curso tiene una duración aproximada de 6 meses, dividido en módulos por cada área de conocimiento según la carrera elegida.',
    },
];

function FAQ() {
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (idx) => {
        setOpenIndex(openIndex === idx ? null : idx);
    };

    return (
        <section id="faq" className="relative py-20 lg:py-28 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="inline-block text-xs font-semibold text-[#1E62A0] bg-blue-50 px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
                        Información
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B2046]">
                        Preguntas Frecuentes
                    </h2>
                    <p className="mt-4 text-gray-500 max-w-2xl mx-auto text-base lg:text-lg">
                        Resuelve tus dudas sobre el proceso de preinscripción y el curso
                    </p>
                </div>

                <div className="max-w-3xl mx-auto space-y-3">
                    {faqs.map((faq, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md"
                        >
                            <button
                                onClick={() => toggle(idx)}
                                className="w-full flex items-center justify-between p-5 text-left"
                            >
                                <span className="text-sm font-semibold text-[#0B2046] pr-4">{faq.pregunta}</span>
                                <svg
                                    className={`w-5 h-5 text-[#1E62A0] flex-shrink-0 transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-300 ${
                                    openIndex === idx ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
                                }`}
                            >
                                <p className="px-5 pb-5 text-sm text-gray-500 leading-relaxed">
                                    {faq.respuesta}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Sección Footer ────────────────────────────────────────────────
function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer id="contacto" className="bg-[#0B2046] text-white">
            {/* Parte superior */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
                    {/* Col 1: Logo + desc */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center gap-3 mb-4">
                            <img
                                src="/Imagenes/Logo-Ficct.png"
                                alt="Logo FICCT"
                                className="h-10 w-10 object-contain"
                            />
                            <div>
                                <span className="text-base font-bold text-white block">FICCT</span>
                                <span className="text-[10px] text-blue-300 font-medium">UAGRM</span>
                            </div>
                        </div>
                        <p className="text-sm text-blue-200/70 leading-relaxed">
                            Facultad de Ciencias de la Computación y Telecomunicaciones. Formando ingenieros para el futuro.
                        </p>
                    </div>

                    {/* Col 2: Enlaces rápidos */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-4">Enlaces</h4>
                        <ul className="space-y-2.5">
                            {[
                                { label: 'Inicio', href: '#hero' },
                                { label: 'Carreras', href: '#carreras' },
                                { label: 'Requisitos', href: '#requisitos' },
                                { label: 'Cronograma', href: '#cronograma' },
                            ].map((link) => (
                                <li key={link.label}>
                                    <a href={link.href} className="text-sm text-blue-200/70 hover:text-white transition-colors">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Col 3: Contacto */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-4">Contacto</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-sm text-blue-200/70">
                                    Av. Universitaria,<br />Santa Cruz, Bolivia
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm text-blue-200/70">contacto@ficct.uagrm.edu.bo</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-sm text-blue-200/70">+591 3 364-2000</span>
                            </li>
                        </ul>
                    </div>

                    {/* Col 4: Acceso */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-4">Acceso</h4>
                        <a
                            href="/login"
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#1E62A0] to-[#2E86C1] rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            Acceso institucional
                        </a>

                        {/* Redes sociales */}
                        <div className="mt-6">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-3">Redes Sociales</h4>
                            <div className="flex gap-3">
                                <a href="#" className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors" aria-label="Facebook">
                                    <svg className="w-4 h-4 text-blue-200" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                </a>
                                <a href="#" className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors" aria-label="Twitter/X">
                                    <svg className="w-4 h-4 text-blue-200" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                    </svg>
                                </a>
                                <a href="#" className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors" aria-label="Instagram">
                                    <svg className="w-4 h-4 text-blue-200" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Barra inferior */}
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-xs text-blue-200/50">
                        &copy; {currentYear} FICCT - UAGRM. Todos los derechos reservados.
                    </p>
                    <p className="text-xs text-blue-200/50">
                        Facultad de Ciencias de la Computación y Telecomunicaciones
                    </p>
                </div>
            </div>
        </footer>
    );
}

// ─── Botón Scroll to Top ───────────────────────────────────────────
function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > 600);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`fixed bottom-6 right-6 z-40 w-12 h-12 bg-gradient-to-r from-[#0B2046] to-[#1E62A0] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
            aria-label="Volver arriba"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
        </button>
    );
}

// ─── Página Principal ──────────────────────────────────────────────
export default function Welcome({ auth, laravelVersion, phpVersion, gestion }) {
    return (
        <>
            <Head title="Curso Preuniversitario FICCT" />

            <div className="min-h-screen bg-gray-50">
                <Navbar gestion={gestion} />
                <Hero gestion={gestion} />
                <Carreras />
                <Requisitos />
                <Costos />
                <Cronograma />
                <FAQ />
                <Footer />
                <ScrollToTop />
            </div>
        </>
    );
}