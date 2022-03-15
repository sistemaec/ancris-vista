import { apiSeguridad } from "@/rutas/seguridad";
import axios from 'axios';

const seguridad = {
  namespaced: true,
  actions: {
    async usuariosPorEstado(context, p) {
      return await axios.get(this.$app.appConfig.apiUrl + apiSeguridad.usuariosPorEstado(p));
    },
    async usuarioModificarEstado(context, p) {
      return await axios.put(this.$app.appConfig.apiUrl + apiSeguridad.usuarioModificarEstado(p.id, p.estado));
    },
    async rolesTodos(context) {
      return await axios.get(this.$app.appConfig.apiUrl + apiSeguridad.rolesTodos());
    },
    async usuarioGuardar(context, p) {
      let config = {
        /*headers: {
          Authorization: ""
        },*/
        url: this.$app.appConfig.apiUrl + apiSeguridad.usuarioGuardar(),
        data: JSON.stringify(p),
        method: 'post',
        //withCredentials: true,
        crossorigin: true
      };
      return await axios(config);
    }
  }
}

export default seguridad;