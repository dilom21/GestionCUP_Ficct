import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

// Inicializar Stripe con la clave pública desde variable de entorno VITE
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

/**
 * Componente PasarelaPago
 * 
 * Estados:
 * - initial: Muestra el botón para iniciar el pago (o se dispara automático si viene id_postulacion)
 * - loading: Procesando solicitud al backend
 * - redirect: Redirigiendo a Stripe Checkout
 * - success: Pago completado exitosamente
 * - cancelled: Pago cancelado por el usuario
 * - error: Ocurrió un error
 */
export default function PasarelaPago({ status, id_postulacion, mensaje, session_id, autoStart = true, token }) {
    const [pagoStatus, setPagoStatus] = useState(status || 'initial');
    const [errorMsg, setErrorMsg] = useState(mensaje || '');
    const [loading, setLoading] = useState(false);

    // Si venimos de Stripe (success/cancelled), ya se maneja con las props
    useEffect(() => {
        if (status === 'success' || status === 'cancelled') {
            setPagoStatus(status);
            setErrorMsg(mensaje || '');
        }
    }, [status, mensaje]);

    // Si nos pasan un id_postulacion y estamos en initial, iniciamos automáticamente
    useEffect(() => {
        if (autoStart && id_postulacion && pagoStatus === 'initial') {
            iniciarPago();
        }
    }, [id_postulacion, autoStart]);

    const iniciarPago = async () => {
        if (!id_postulacion) {
            setPagoStatus('error');
            setErrorMsg('No se ha especificado una postulación para el pago.');
            return;
        }

        setLoading(true);
        setPagoStatus('loading');
        setErrorMsg('');

        try {
            // 1. Solicitar la creación de la sesión al backend
            const body = { id_postulacion: id_postulacion };
            if (token) body.token = token;
            const response = await axios.post(route('pago.crear-sesion'), body);

            const { url } = response.data;

            // 2. Redirigir al Checkout de Stripe
            setPagoStatus('redirect');
            window.location.href = url;
        } catch (error) {
            setPagoStatus('error');

            if (error.response) {
                const { data, status } = error.response;

                if (status === 401) {
                    setErrorMsg('Debes iniciar sesión para realizar el pago.');
                } else if (status === 403) {
                    setErrorMsg(data.error || 'No tienes permisos para pagar esta postulación.');
                } else if (status === 404) {
                    setErrorMsg('Postulación no encontrada.');
                } else if (status === 409) {
                    setErrorMsg(data.error || 'Esta postulación ya tiene un pago confirmado.');
                } else if (status === 500) {
                    setErrorMsg(data.error || 'Error al procesar el pago. Intenta nuevamente.');
                } else {
                    setErrorMsg(data.error || 'Ocurrió un error inesperado.');
                }
            } else {
                setErrorMsg('Error de conexión. Verifica tu conexión a internet.');
            }

            console.error('Error al iniciar pago:', error);
        } finally {
            setLoading(false);
        }
    };

    // Renderizado según el estado
    const renderContent = () => {
        switch (pagoStatus) {
            case 'loading':
                return (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-4"></div>
                        <h3 className="text-lg font-medium text-gray-900">
                            Preparando tu pago seguro...
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Estamos conectando con la pasarela de pago Stripe.
                        </p>
                    </div>
                );

            case 'redirect':
                return (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-4"></div>
                        <h3 className="text-lg font-medium text-gray-900">
                            Redirigiendo al sitio seguro de pago...
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Serás redirigido al Checkout de Stripe para completar el pago de forma segura.
                        </p>
                    </div>
                );

            case 'success':
                return (
                    <div className="text-center py-12">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                            ¡Pago exitoso!
                        </h3>
                        <p className="mt-2 text-sm text-gray-600">
                            {mensaje || 'Tu pago ha sido procesado correctamente. Recibirás una confirmación en breve.'}
                        </p>
                        {session_id && (
                            <p className="mt-1 text-xs text-gray-400">
                                ID de transacción: {session_id}
                            </p>
                        )}
                        <div className="mt-6">
                            <a
                                href="/postulante/dashboard"
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                Volver al panel
                            </a>
                        </div>
                    </div>
                );

            case 'cancelled':
                return (
                    <div className="text-center py-12">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                            <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                            Pago cancelado
                        </h3>
                        <p className="mt-2 text-sm text-gray-600">
                            {mensaje || 'Has cancelado el proceso de pago. Puedes intentarlo nuevamente cuando quieras.'}
                        </p>
                        <div className="mt-6 space-x-3">
                            <button
                                onClick={iniciarPago}
                                disabled={loading}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {loading ? 'Procesando...' : 'Intentar nuevamente'}
                            </button>
                            <a
                                href="/postulante/dashboard"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Volver al panel
                            </a>
                        </div>
                    </div>
                );

            case 'error':
                return (
                    <div className="text-center py-12">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                            Error al procesar el pago
                        </h3>
                        <p className="mt-2 text-sm text-red-600">
                            {errorMsg || 'Ocurrió un error inesperado.'}
                        </p>
                        <div className="mt-6 space-x-3">
                            <button
                                onClick={iniciarPago}
                                disabled={loading}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {loading ? 'Procesando...' : 'Reintentar'}
                            </button>
                            <a
                                href="/postulante/dashboard"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Volver al panel
                            </a>
                        </div>
                    </div>
                );

            default: // 'initial'
                return (
                    <div className="text-center py-12">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4">
                            <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                            Pago de inscripción CUP
                        </h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Confirma tu postulación realizando el pago correspondiente a través de nuestra pasarela segura Stripe.
                        </p>
                        <div className="mt-4 bg-gray-50 rounded-lg p-4 inline-block">
                            <p className="text-sm text-gray-500">
                                Monto a pagar:
                                <span className="ml-2 text-lg font-semibold text-gray-900">350.00 Bs</span>
                            </p>
                        </div>
                        <div className="mt-6">
                            <button
                                onClick={iniciarPago}
                                disabled={loading}
                                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Procesando...
                                    </>
                                ) : (
                                    'Pagar ahora con Stripe'
                                )}
                            </button>
                        </div>
                        <p className="mt-4 text-xs text-gray-400">
                            Pago 100% seguro procesado por Stripe. No almacenamos datos de tu tarjeta.
                        </p>
                    </div>
                );
        }
    };

    return (
        <>
            <Head title="Pasarela de Pago" />

            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            Gestión CUP
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Sistema de pago de inscripción
                        </p>
                    </div>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        {renderContent()}
                    </div>

                    {/* Sellos de seguridad */}
                    <div className="mt-4 flex justify-center space-x-6">
                        <div className="flex items-center text-xs text-gray-400">
                            <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            Conexión segura (SSL)
                        </div>
                        <div className="flex items-center text-xs text-gray-400">
                            <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            PCI Compliant
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}