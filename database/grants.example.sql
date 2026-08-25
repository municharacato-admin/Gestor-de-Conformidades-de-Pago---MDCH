\set ON_ERROR_STOP on

-- Ejecute conectado a gestor_conformidades como su propietario/migrador.
-- Este ejemplo supone que el rol local gestor_app ya existe.

GRANT CONNECT ON DATABASE gestor_conformidades TO gestor_app;
GRANT USAGE ON SCHEMA public TO gestor_app;

GRANT SELECT, INSERT
    ON TABLE public.usuarios
    TO gestor_app;

GRANT SELECT
    ON TABLE public.unidades_organicas
    TO gestor_app;

GRANT SELECT, INSERT, UPDATE, DELETE
    ON TABLE public.expedientes, public.historial_expedientes
    TO gestor_app;

GRANT USAGE, SELECT
    ON SEQUENCE public.expedientes_id_seq,
                public.historial_expedientes_id_seq
    TO gestor_app;

