/**
 * Dependencias propias
 */
import conect from '../../connect_db.js';

export async function get_unidades_organicas (){
    try {
        const response = await obtener_datos();
        return{
            success: true,
            response: response
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }
}

async function obtener_datos(){
    try{
        const query = {
            text: `SELECT * FROM unidades_organicas WHERE id NOT IN (25, 26);`//obtiene todas las unidades organicas menos las de administrador y mesa de partes
        }
        const resultado = await conect.query(query);
        return resultado.rows;
    }catch (error){
        throw new Error("Error en la consulta")
    }
}