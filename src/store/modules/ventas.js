import { ventaPorNumero, ventaGuardar, ventasBuscar, ventaPorId } from "@/rutas/ventas";
import { tipoFactura, tipoNotaVenta, tipoDevolucion } from "@/constants/tipos";
import moment from 'moment'
import axios from 'axios';

const ventas = {
  namespaced: true,
  state: {
    facturasBuscadorCache: {
      texto: "",
      desde: null,
      hasta: null,
      tipo: 0,
      extendida: false,
      eliminados: false,
      atributo: null,
      lista: [],
    },
    notasvBuscadorCache: {
      texto: "",
      desde: null,
      hasta: null,
      tipo: 0,
      extendida: false,
      eliminados: false,
      atributo: null,
      lista: [],
    },
    devolucionesBuscadorCache: {
      texto: "",
      desde: null,
      hasta: null,
      tipo: 0,
      extendida: false,
      eliminados: false,
      atributo: null,
      lista: [],
    },
  },
  actions: {
    async ventaPorNumero(context, p) {
      let ruta = this.$app.appConfig.apiUrl + ventaPorNumero(p.tipo, p.numero);
      const response = await axios.get(ruta)
        .catch(e => {
          return {
            id: -1, 
            respuesta: e
          };
        });
        return {
          id: 1,
          respuesta: response
        };
    },
    async ventaPorId(context, p) {
      let ruta = this.$app.appConfig.apiUrl + ventaPorId(p);
      return await axios.get(ruta)
    },
    cacheBuscadorTipo({state}, ptipo) {
      let ret = null;
      switch (ptipo) {
        case tipoFactura: {ret = state.facturasBuscadorCache; break;}
        case tipoNotaVenta: {ret = state.notasvBuscadorCache; break;}
        case tipoDevolucion: {ret = state.devolucionesBuscadorCache; break;}
      }
      return ret;
    },
    async ventaGuardar(context, p) {
      let ent = JSON.parse(JSON.stringify(p));
      ent.fecha = moment(p.fecha).format("YYYY-MM-DD");
      ent = JSON.stringify(ent)
      let config = {
        /*headers: {
          Authorization: ""
        },*/
        url: this.$app.appConfig.apiUrl + ventaGuardar(),
        data: ent,
        method: 'post',
        //withCredentials: true,
        crossorigin: true
      };
      return await axios(config);
      
    },
    async ventasBuscar(context) {
      //sucursal, clase, estado, desde, hasta, tipo, filtro
      let des = moment(context.rootState.movimientoBuscador.desde).format("YYYY-MM-DD");
      let has = moment(context.rootState.movimientoBuscador.hasta).format("YYYY-MM-DD");
      // Formatear fecha
      let txt = "_";
      if (context.rootState.movimientoBuscador.texto.length > 0) {
        txt = context.rootState.movimientoBuscador.texto;
      }
      let p = context.rootState.movimientoBuscador.atributo != null ? context.rootState.movimientoBuscador.atributo.id : 0;
      let estado = context.rootState.movimientoBuscador.eliminados ? 9 : 0;
      let tipo = context.rootState.movimientoBuscador.extendida ? 1 : 0;
      let ruta = this.$app.appConfig.apiUrl + ventasBuscar(
        p,
        context.rootState.movimientoBuscador.tipo,
        estado,
        des,
        has,
        tipo,
        txt
      );
      const response = await axios.get(ruta, context.rootState.remotoConfig)
        .catch(e => {
          return { 
            id: -1, 
            respuesta: e
          };
        });
      return {
        id: 1,
        respuesta: response
      };
    },
    async ventasBuscarGrupo(context, p) {
      p.desde = moment(p.desde).format('YYYY-MM-DD');
      p.hasta = moment(p.hasta).format('YYYY-MM-DD');
      //let p = context.rootState.movimientoBuscador.atributo != null ? context.rootState.movimientoBuscador.atributo.id : 0;
      let ruta = this.$app.appConfig.apiUrl + ventasBuscar(
        1, // Sucursal
        1, // Buscar por fecha
        0, // Estado activo
        p.desde,
        p.hasta,
        0, // Extendidad o normal
        '_'
      );
      const response = await axios.get(ruta, context.rootState.remotoConfig)
        .catch(e => {
          return { 
            id: -1, 
            respuesta: e
          };
        });
      return {
        id: 1,
        respuesta: response
      };
    }
  },
  mutations: {
    // Cache de busqueda de ventas
    setBuscacheVentasDesde(state, p) {
      switch (p.tipo) {
        case tipoFactura: { state.facturasBuscadorCache.desde = p.valor; break; }
        case tipoNotaVenta: { state.notasvBuscadorCache.desde = p.valor; break; }
        case tipoDevolucion: { state.devolucionesBuscadorCache.desde = p.valor; break; }
      }
    },
    setBuscacheVentasHasta(state, p) {
      switch (p.tipo) {
        case tipoFactura: { state.facturasBuscadorCache.hasta = p.valor; break; }
        case tipoNotaVenta: { state.notasvBuscadorCache.hasta = p.valor; break; }
        case tipoDevolucion: { state.devolucionesBuscadorCache.hasta = p.valor; break; }
      }
    },
    setBuscacheVentasTipo(state, p) {
      switch (p.tipo) {
        case tipoFactura: { state.facturasBuscadorCache.tipo = p.valor; break; }
        case tipoNotaVenta: { state.notasvBuscadorCache.tipo = p.valor; break; }
        case tipoDevolucion: { state.devolucionesBuscadorCache.tipo = p.valor; break; }
      }
    },
    setBuscacheVentasAtributo(state, p) {
      switch (p.tipo) {
        case tipoFactura: { state.facturasBuscadorCache.atributo = p.valor; break; }
        case tipoNotaVenta: { state.notasvBuscadorCache.atributo = p.valor; break; }
        case tipoDevolucion: { state.devolucionesBuscadorCache.atributo = p.valor; break; }
      }
    },
    setBuscacheVentasTexto(state, p) {
      switch (p.tipo) {
        case tipoFactura: { state.facturasBuscadorCache.texto = p.valor; break; }
        case tipoNotaVenta: { state.notasvBuscadorCache.texto = p.valor; break; }
        case tipoDevolucion: { state.devolucionesBuscadorCache.texto = p.valor; break; }
      }
    },
    setBuscacheVentasExtendida(state, p) {
      switch (p.tipo) {
        case tipoFactura: { state.facturasBuscadorCache.extendida = p.valor; break; }
        case tipoNotaVenta: { state.notasvBuscadorCache.extendida = p.valor; break; }
        case tipoDevolucion: { state.devolucionesBuscadorCache.extendida = p.valor; break; }
      }
    },
    setBuscacheVentasEliminados(state, p) {
      switch (p.tipo) {
        case tipoFactura: { state.facturasBuscadorCache.eliminados = p.valor; break; }
        case tipoNotaVenta: { state.notasvBuscadorCache.eliminados = p.valor; break; }
        case tipoDevolucion: { state.devolucionesBuscadorCache.eliminados = p.valor; break; }
      }
    },
    setBuscacheVentasLista(state, p) {
      switch (p.tipo) {
        case tipoFactura: { state.facturasBuscadorCache.lista = p.valor; break; }
        case tipoNotaVenta: { state.notasvBuscadorCache.lista = p.valor; break; }
        case tipoDevolucion: { state.devolucionesBuscadorCache.lista = p.valor; break; }
      }
    },
  }
}

export default ventas;