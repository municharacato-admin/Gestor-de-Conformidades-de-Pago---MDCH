-- Datos mínimos de demostración.
-- No contiene usuarios, contraseñas, expedientes ni información institucional real.
-- Debe ejecutarse después de database/schema.sql.

BEGIN;

INSERT INTO public.roles (id, nombre) VALUES
    (1, 'Administrador'),
    (2, 'Mesa de partes'),
    (3, 'usuario')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

-- Los IDs 8, 25, 26, 27, 28 y 29 están acoplados al código actual.
-- Los nombres siguientes son deliberadamente ficticios.
INSERT INTO public.unidades_organicas (id, nombre) VALUES
    (8,  'Administración de demostración'),
    (25, 'Perfil administrador de demostración'),
    (26, 'Mesa de partes de demostración'),
    (27, 'Tesorería de demostración'),
    (28, 'Contabilidad de demostración'),
    (29, 'Logística de demostración'),
    (30, 'Área usuaria de demostración')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre;

SELECT pg_catalog.setval(
    'public.roles_id_seq',
    (SELECT MAX(id) FROM public.roles),
    true
);

SELECT pg_catalog.setval(
    'public.unidades_organicas_id_seq',
    (SELECT MAX(id) FROM public.unidades_organicas),
    true
);

COMMIT;
