<template>
  <b-row class="mt-4">
    <b-colxx xxs="12" md="10" class="mx-auto my-auto">
      <b-card class="auth-card">       
        <b-jumbotron>
          <template #header>
            <b-row class="d-inline-flex">
              <b-col>
                <img alt="ANCRIS" width="70" src="@/assets/logos/mobile.png">
              </b-col>
              <b-col>
                <h1 class="pt-4">ANCRIS</h1>
              </b-col>
            </b-row>
          </template>
          <template #lead>
            Centro médico comunitario
          </template>
          <hr class="my-4">
          <p>En ANCRIS contamos con profesionales para la prestación de servicios médicos y de diagnóstico en distintas especialidades con la finalidad de cuidar con vocación humanitaria la salud de todos en nuestra comunidad.</p>
          <b-form-group label="Agendar consulta" class="has-float-label mb-4">
            <b-form-input ref="txCedula" size="sm" v-model="cedula" placeholder="Digite su numero de cédula o R.U.C" @keyup.enter="agendar()"/>
          </b-form-group>
          <p class="lead mb-0">
            <b-button variant="primary" class="mr-4 mt-4 mb-4" size="lg" @click="agendar()">Agendar consulta</b-button>
            <b-button to="/usuario/acceder" class="mt-2 mb-2" variant="success" size="lg">Acceder al sistema</b-button>
          </p>
        </b-jumbotron>
      </b-card>
    </b-colxx>
  </b-row>
</template>

<script>
import { cedulaValida } from '../utils'
export default {
  data() {
    return {
      cedula: ""
    }
  },
  methods: {
    agendar() {
      let val = false;
      if (this.cedula.length == 10 || this.cedula.length == 13) {
        if (this.cedula.length == 10) {
          val = cedulaValida(this.cedula);
        } else {
          val = true;
        }
      }
      if (val) {
        this.$router.push({
          name: "agendar",
          params: {
            id: 0,
            dato: null,
            lectura: false,
            cedula: this.cedula,
            publico: true
          }
        });
      } else {
        this.$notify("error", 
          this.$t("vista.comandos.fallo") + ' ' + this.$t('vista.comandos.continuar'),
          this.$t("vista.ventas.clientes.validacion.cedula"),
          { duration: 3000,	permanent: false	});
      }
    }
  }
}
</script>