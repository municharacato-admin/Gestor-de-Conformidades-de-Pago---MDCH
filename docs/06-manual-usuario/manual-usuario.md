# Manual de usuario

> Documentación liberada bajo Apache License 2.0. Consulte LICENSE y LICENCIA.txt.

## Acceso

1. Abra la dirección del sistema proporcionada por la entidad.
2. Ingrese su nombre de usuario y contraseña.
3. Seleccione **Iniciar sesión**.

El sistema muestra el módulo correspondiente al perfil asignado: Mesa de partes, Unidad orgánica o Administración.

## Mesa de partes

### Registrar un expediente

1. Abra el formulario de registro.
2. Seleccione la unidad orgánica de destino.
3. Ingrese el número de expediente.
4. Seleccione **Registrar expediente**.

La bandeja muestra los expedientes enviados, su destino, fecha, estado y plazo. Desde la tabla puede buscar, ordenar y exportar la información a Excel.

### Retirar un registro

La opción de eliminación está disponible mientras el expediente no haya sido recibido ni tenga movimientos posteriores. Confirme la operación en el cuadro de diálogo.

## Unidad orgánica

El módulo organiza los expedientes en cinco bandejas:

- **Por recepcionar:** expedientes enviados a la unidad que aún no tienen fecha de recepción.
- **Recepcionados:** expedientes que la unidad tiene en atención.
- **Derivados:** expedientes enviados a otra unidad.
- **Cancelados:** expedientes cerrados por cancelación.
- **Pagados:** expedientes cuyo pago fue registrado.

### Recibir un expediente

1. Abra **Por recepcionar**.
2. Ubique el expediente.
3. Seleccione **Recepcionar**.

El registro pasa a la bandeja **Recepcionados**.

### Revertir una recepción

En **Recepcionados**, seleccione la opción para revertir la recepción y confirme. El expediente vuelve a **Por recepcionar**.

### Derivar un expediente

1. En **Recepcionados**, seleccione **Derivar exp.**.
2. Elija la unidad orgánica de destino.
3. Escriba la justificación.
4. Seleccione **Derivar**.

La derivación aparece en la bandeja **Derivados**. Mientras el destino no la reciba, puede retirarse con la opción de eliminación.

### Cancelar un expediente

1. En **Recepcionados**, seleccione **Cancelar exp.**.
2. Ingrese la justificación.
3. Confirme la cancelación.

### Registrar el pago

En **Recepcionados**, seleccione la acción de pago y confirme. El expediente pasa a **Pagados**.

### Consultar información

Las tablas permiten buscar, ordenar y exportar resultados. Los indicadores resumen expedientes por estado, actividad y unidad orgánica. La opción **Ver historial** presenta el recorrido cronológico de cada expediente.

## Preferencias y cierre de sesión

El selector de tema permite usar apariencia clara, oscura o automática. Para terminar, seleccione **Cerrar sesión** en el menú lateral.

## Mensajes frecuentes

| Mensaje o situación | Acción |
| --- | --- |
| Credenciales incorrectas | Verifique el usuario y la contraseña. |
| Sesión expirada | Inicie sesión nuevamente. |
| Expediente duplicado | Revise el número antes de registrar. |
| La bandeja no se actualiza | Recargue la página y repita la consulta. |
| Una acción no está disponible | Verifique el estado del expediente y su perfil asignado. |
