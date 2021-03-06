<template>
  <div>
    <b-row>
      <b-colxx xxs="12">
        <encabezado-tabla
          :titulo="tipo"
          :crear="crear"
          :buscar="buscar"
          :actualizar="buscar"
          :desde="desde"
          :hasta="hasta"
          :total="total"
          :xPagina="porPagina"
          :lPaginas="lPaginas"
          :cambiarPagina="cambiarPagina"
        ></encabezado-tabla>
      </b-colxx>
    </b-row>
    <b-row>
      <b-colxx xxs="12">
        <b-card class="mb-4">
          <b-table
            ref="tablaMovimientos"
            class="vuetable"
            :per-page="porPagina"
            :fields="columnas"
            :items="movimientos"
            :current-page="paginaActual"
            :busy="busquedaEjecutando"
          >
            <template #table-busy>
              <table-busy :mensaje="$t('vista.busqueda.ejecutandoq') + '...'" />
            </template>
            <template #cell(acciones)="row">
              <span v-if="row.item.estado == 0"
                class="span-comando mdi mdi-pen mdi-18px mr-2"
                @click="modificar(row)"
                v-b-tooltip.hover
                title="Modificar"
              />
              <span v-if="row.item.estado == 0"
                class="span-comando mdi mdi-trash-can-outline mdi-18px" 
                @click="eliminar(row)"
                v-b-tooltip.hover
                title="Eliminar"
              />
              <span v-if="row.item.estado == 2"
                class="span-comando mdi mdi-restore mdi-18px" 
                @click="restaurar(row)"
                v-b-tooltip.hover
                title="Restaurar"
              />
            </template>
            <template #cell(fecha)="fila">
              {{ formatearFecha(fila.item.fecha) }}
            </template>
            <template #cell(estado)="fila">
              <b-badge :variant="$t('vista.estados.colores.' + fila.item.estado)">
                {{ $t('vista.estados.' + fila.item.estado) }}
              </b-badge>
            </template>
          </b-table>
          <b-pagination
            size="sm"
            align="center"
            :total-rows="total"
            :per-page="porPagina"
            :value="paginaActual"
            v-on:change="cambiarPaginaActual($event)"
            :sort-by.sync="orden"
            :sort-desc.sync="ordenDesc"
            sort-icon-left
          >
            <template v-slot:next-text>
              <i class="simple-icon-arrow-right"/>
            </template>
            <template v-slot:prev-text>
              <i class="simple-icon-arrow-left"/>
            </template>
            <template v-slot:first-text>
              <i class="simple-icon-control-start"/>
            </template>
            <template v-slot:last-text>
              <i class="simple-icon-control-end"/>
            </template>
          </b-pagination>
        </b-card>
      </b-colxx>
    </b-row>
  </div>
</template>

<script>
import EncabezadoDocs from "@/containers/views/EncabezadoDocumentos";
export default {
  components: {
    "encabezado-tabla": EncabezadoDocs
  },
  props: [
    "tipo",
    "tipoId",
    "rutaNuevo",
    "rutaModificar"
  ],
  data() {
    return {
      orden: "numero",
      ordenDesc: false,
      porPagina: 10,
      paginaActual: 1,
      lPaginas: [ 5, 10, 15, 20 ],
      desde: 0,
      hasta: 0,
      bodegas: [],
      columnas: [
        {
          label: this.$t("vista.comandos.acciones"), 
          key: "acciones", 
          sortable: false,
        },
        { 
          label: this.$t("vista.transacciones.campos.numero"), 
          key: "numero",
          sortable: true
        },
        { 
          label: this.$t("vista.transacciones.campos.fecha"), 
          key: "fecha",
          sortable: true,
        },
        {
          label: this.$t("vista.transacciones.campos.concepto"), 
          key: "descripcion", 
          sortable: true 
        },
        {
          label: this.$t("vista.clinica.consultas.campos.estado"),
          key: "estado",
          sortable: true
        }
      ],
      movimientos: [],
      busquedaEjecutando: false
    }
  },
  computed: {
    total() {
      if (!this.busquedaEjecutando) {
        return this.movimientos.length;
      } else {
        return  0;
      }
    },
    paginas() {
      return Math.ceil(this.total / this.porPagina)
    }
  },
  methods: {
    cambiarPagina(p) {
      this.porPagina = p;
    },
    cambiarPaginaActual(e) {
      if (this.total == 0) {
        this.desde = 0;
      } else {
        if (e == 1) {
          this.desde = e;
        } else {
          this.desde = ((e - 1) * this.porPagina) + 1;
        };
      }
      if (this.total == 0) {
        this.hasta = 0;
      } else {
        if (e == this.paginas) {
          this.hasta = this.total;
        } else {
          this.hasta = (this.desde - 1) + this.porPagina;
        }
      }
      this.paginaActual = e;
    },
    buscar() {
      this.busquedaEjecutando = true;
      this.movimientos = [];
      this.paginaActual = 1;
      this.$store
        .dispatch("inventarios/movimientosBuscar")
        .then(function(r) {
          if (r.id == 1) {
            if (r.respuesta.data != undefined) {
              this.movimientos = r.respuesta.data;
            }
          }
          this.busquedaEjecutando = false;
          if (this.movimientos.length <= 0) {
            this.$notify("warning",
              this.$t("vista.comandos.buscar") + " " + this.tipo,
              this.$t("vista.busqueda.no-encontrado"),
              { duration: 3000, permanent: false });
          } else {
            this.paginaActual = 1;
            this.cambiarPaginaActual(1);
          }
        }.bind(this))
        .catch(function(e) {
          console.log("Error");
          console.log(e);
          this.busquedaEjecutando = false;
          this.$notify("warning",
            this.$t("vista.comandos.buscar") + " " + this.tipo,
            this.$t("vista.busqueda.no-encontrado"),
            { duration: 3000, permanent: false });
        }.bind(this));
    },
    modificar(p) {
      this.abrirEditor(this.rutaModificar, p.item.id, p.item);
    },
    crear() {
      this.abrirEditor(this.rutaNuevo, 0, null);
    },
    abrirEditor(ruta, pid, psel){
      this.$router.push({
        name: ruta,
        params: {
          id: pid,
          dato: psel,
          tipo: this.tipo,
          tipoId: this.tipoId
        }
      });
    },
    restaurar(p) {
      this.modificarEstado(p.item.id, 0);
    },
    eliminar(p) {
      this.modificarEstado(p.item.id, 2);
    },
    modificarEstado(pid, pestado) {
      let comando = "Eliminar";
      if (pestado == 0)
        comando = "Restaurar";
      this.busquedaEjecutando = true;
      this.$store
        .dispatch("inventarios/movimientoModificarEstado", {
          id: pid,
          estado: pestado
         })
        .then(function(r) {
          this.buscar();
          this.mensaje(r.data, comando + " " + this.tipo, "success");
        }.bind(this))
        .catch(function(e) {
          console.log("Error");
          console.log(e);
          this.$notify("warning",
            comando + " " + this.tipo,
            this.$t("vista.comandos.fallo") + " " + comando.toLowerCase() + " " + this.tipo,
            { duration: 3000, permanent: false });
        }.bind(this));
      this.busquedaEjecutando = false;
    },
    mensaje(contenido, titulo, variante) {
      this.counter++
      this.$bvToast.toast(contenido, {
        title: titulo,
        variant: variante,
        toaster: 'b-toaster-bottom-right',
        solid: true,
        appendToast: false
      })
    },
    formatearFecha(f) {
      return this.$moment(f).format('YYYY-MM-DD');
    },
    cargarTipo(p) {
      this.movimientos = [];
      this.$store
        .dispatch("inventarios/cacheBuscadorTipo", p)
        .then(function(ccbusca) {
          this.$store.commit('setBuscaMovimientosTipo', ccbusca.tipo);
          this.$store.commit('inventarios/setBuscacheMovimientosTipo', { tipo: p, valor: 0 });
          if (ccbusca != undefined && ccbusca.lista.length > 0) {
            this.movimientos = ccbusca.lista;
            this.$store.commit('inventarios/setBuscacheMovimientosLista', { tipo: p, valor: [] });
          }
          if (ccbusca.texto.length > 0) {
            this.$store.commit('setBuscaMovimientosTexto', ccbusca.texto);
            this.$store.commit('inventarios/setBuscacheMovimientosTexto', { tipo: p, valor: ''});
          }
          if (ccbusca.desde != null) {
            this.$store.commit('setBuscaMovimientosDesde', this.$moment(ccbusca.desde).toDate());
            this.$store.commit('inventarios/setBuscacheMovimientosDesde', { tipo: p, valor: this.$moment.format('YYYY-MM-DD') });
          } else {
            this.$store.commit('setBuscaMovimientosDesde', new Date());
          }
          if (ccbusca.hasta != null) {
            this.$store.commit('setBuscaMovimientosHasta', this.$moment(ccbusca.hasta).toDate());
            this.$store.commit('inventarios/setBuscacheMovimientosHasta', { tipo: p, valor: this.$moment.format('YYYY-MM-DD') });
          } else {
            this.$store.commit('setBuscaMovimientosHasta', new Date());
          }
          if (ccbusca.atributo != null) {
            this.$store.commit('setBuscaMovimientosAtributo', ccbusca.atributo);
            this.$store.commit('inventarios/setBuscacheMovimientosAtributo', { tipo: p, valor: null });
          }
          if (ccbusca.extendida) {
            this.$store.commit('setBuscaMovimientosExtendida', ccbusca.extendida);
            this.$store.commit('inventarios/setBuscacheMovimientosExtendida', { tipo: p, valor: false });
          }
          if (ccbusca.eliminados) {
            this.$store.commit('setBuscaMovimientosEliminados', ccbusca.eliminados);
            this.$store.commit('inventarios/setBuscacheMovimientosEliminados', { tipo: p, valor: false });
          }
        }.bind(this));
    },
    respaldarTipo(p) {
      this.$store.commit('inventarios/setBuscacheMovimientosLista',  { tipo: p, valor: this.movimientos });
      if (this.$store.state.movimientoBuscador.texto.length > 0) {
        this.$store.commit('inventarios/setBuscacheMovimientosTexto',  { tipo: p, valor: this.$store.state.movimientoBuscador.texto });
        this.$store.commit('setBuscaMovimientosTexto', '');
      }
      if (this.$store.state.movimientoBuscador.tipo > 0) {
        this.$store.commit('inventarios/setBuscacheMovimientosTipo',  { tipo: p, valor: this.$store.state.movimientoBuscador.tipo });
        this.$store.commit('setBuscaMovimientosTipo', '');
      }
      if (this.$store.state.movimientoBuscador.desde != null) {
        this.$store.commit('inventarios/setBuscacheMovimientosDesde',  { tipo: p, valor: this.$store.state.movimientoBuscador.desde });
        this.$store.commit('setBuscaMovimientosDesde', '');
      }
      if (this.$store.state.movimientoBuscador.hasta != null) {
        this.$store.commit('inventarios/setBuscacheMovimientosHasta',  { tipo: p, valor: this.$store.state.movimientoBuscador.hasta });
        this.$store.commit('setBuscaMovimientosHasta', '');
      }
      if (this.$store.state.movimientoBuscador.atributo != null) {
        this.$store.commit('inventarios/setBuscacheMovimientosAtributo',  { tipo: p, valor: this.$store.state.movimientoBuscador.atributo });
        this.$store.commit('setBuscaMovimientosAtributo', '');
      }    
      if (this.$store.state.movimientoBuscador.extendida) {
        this.$store.commit('inventarios/setBuscacheMovimientosExtendida',  { tipo: p, valor: this.$store.state.movimientoBuscador.extendida });
        this.$store.commit('setBuscaMovimientosExtendida', false);
      }
      if (this.$store.state.movimientoBuscador.eliminados) {
        this.$store.commit('inventarios/setBuscacheMovimientosEliminados',  { tipo: p, valor: this.$store.state.movimientoBuscador.eliminados });
        this.$store.commit('setBuscaMovimientosEliminados', false);
      }
    }
  },
  watch: {
    $route(to, from) {
      this.respaldarTipo(from.matched[2].props.default.tipoId);
      this.cargarTipo(to.matched[2].props.default.tipoId);
    }
  },
  created() {
    this.$store
      .dispatch("inventarios/bodegasPorEstado", 0)
      .then(function(r) {
        this.$store.commit('setBuscaMovimientosControItems', r.data);
        this.$store.commit("setBuscaMovimientosAtributo", r.data[0]);
      }.bind(this));  
  },
  mounted() {
    this.cargarTipo(this.tipoId);
  },
  beforeDestroy() {
    this.respaldarTipo(this.tipoId);
  }
}
</script>
