/* @license Apache-2.0; ver LICENCIA.txt */

const validator = new JustValidate('#formulario_login');

validator
  .addField('#usuario', [
    {
      rule: 'required',
    }
  ])
  .addField('#contrasenia', [
    {
      rule: 'required',
    }
  ]).onSuccess(( event ) => {
    verificar_login();
});
