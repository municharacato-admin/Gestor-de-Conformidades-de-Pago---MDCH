/* @license Apache-2.0; ver LICENCIA.txt */

-- Gestor de Conformidades de Pago – MDCH
-- Esquema estructural derivado de database/bk-clean.sql.
-- No contiene datos, propietarios, credenciales ni valores de secuencia.
-- Fuente: PostgreSQL 17.6; pg_dump 18.4.

BEGIN;

CREATE SEQUENCE public.expedientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.expedientes (
    id integer NOT NULL DEFAULT nextval('public.expedientes_id_seq'::regclass),
    numero_expediente text NOT NULL,
    fecha_hora_creacion timestamp without time zone NOT NULL,
    fecha_hora_termino timestamp without time zone NOT NULL,
    estado text NOT NULL,
    CONSTRAINT expedientes_pkey PRIMARY KEY (id)
);

ALTER SEQUENCE public.expedientes_id_seq
    OWNED BY public.expedientes.id;

CREATE SEQUENCE public.historial_expedientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.historial_expedientes (
    id integer NOT NULL DEFAULT nextval('public.historial_expedientes_id_seq'::regclass),
    id_expediente integer NOT NULL,
    id_unidad_origen integer NOT NULL,
    id_unidad_destino integer NOT NULL,
    fecha_envio timestamp without time zone NOT NULL,
    fecha_recepcion timestamp without time zone,
    estado text NOT NULL,
    justificacion text,
    CONSTRAINT historial_expedientes_pkey PRIMARY KEY (id)
);

ALTER SEQUENCE public.historial_expedientes_id_seq
    OWNED BY public.historial_expedientes.id;

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.roles (
    id integer NOT NULL DEFAULT nextval('public.roles_id_seq'::regclass),
    nombre text,
    CONSTRAINT roles_pkey PRIMARY KEY (id),
    CONSTRAINT roles_nombre_key UNIQUE (nombre)
);

ALTER SEQUENCE public.roles_id_seq
    OWNED BY public.roles.id;

CREATE SEQUENCE public.unidades_organicas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.unidades_organicas (
    id integer NOT NULL DEFAULT nextval('public.unidades_organicas_id_seq'::regclass),
    nombre text,
    CONSTRAINT unidades_organicas_pkey PRIMARY KEY (id),
    CONSTRAINT unidades_organicas_nombre_key UNIQUE (nombre)
);

ALTER SEQUENCE public.unidades_organicas_id_seq
    OWNED BY public.unidades_organicas.id;

CREATE TABLE public.usuarios (
    id uuid NOT NULL,
    id_unidad_organica integer NOT NULL,
    id_rol integer NOT NULL,
    usuario text NOT NULL,
    contrasenia text NOT NULL,
    CONSTRAINT usuarios_pkey PRIMARY KEY (id),
    CONSTRAINT usuarios_id_unidad_organica_key UNIQUE (id_unidad_organica),
    CONSTRAINT usuarios_usuario_key UNIQUE (usuario),
    CONSTRAINT usuarios_contrasenia_key UNIQUE (contrasenia)
);

-- El volcado fuente no contiene claves foráneas, CHECK ni índices adicionales.
-- Las relaciones usadas por el código se documentan como relaciones lógicas en
-- docs/04-base-datos/relaciones.md. No se añaden aquí para no alterar el esquema
-- real sin una migración aprobada y una validación previa de los datos.

COMMIT;
