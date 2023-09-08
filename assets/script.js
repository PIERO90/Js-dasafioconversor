const pesos = document.querySelector("#inputClp");
const monedaSeleccionada = document.querySelector("#monedaSeleccionada");
const boton = document.querySelector("#boton");
const monedaConvertida = document.querySelector("#monedaConvertida");
const miGraf = document.querySelector("#myChart");
let myChart;
const apiUrl = "https://mindicador.cl/api";

async function obtenerMonedas(url) {
  try {
    const res = await fetch(url);
    const monedas = await res.json();
    return monedas;
  } catch (error) {
    alert("Error al cargar el monto!");
    return;
  }
}

async function renderConvierteMonedas() {
  try {
    const monedas = await obtenerMonedas(apiUrl);
    let tipoMoneda = "";
    if (monedas[monedaSeleccionada.value].codigo === "dolar") {
      tipoMoneda = "USD";
    } else {
      tipoMoneda = "EUR";
    }
    monedaConvertida.innerHTML = `Resultado: ${new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: tipoMoneda,
    }).format((pesos.value / monedas[monedaSeleccionada.value].valor).toFixed(2))}`;
  } catch (error) {
    alert("Seleccione Moneda a convertir");
  }
}

boton.addEventListener("click", () => {
  if (pesos.value == "" || pesos.value <= 0) {
    alert("Ingrese un monto mayor a cero");
    pesos.value = "";
    return;
  }
  renderConvierteMonedas();
  graficoTotal();
});

function graficoTotal() {
  async function cargaDatosParaGrafico() {
    try {
      const urlGrafico = await fetch(apiUrl + "/" + monedaSeleccionada.value);
      const datosGrafico = await urlGrafico.json();

      const label = datosGrafico.serie.map((ejeX) => {
        return ejeX.fecha.split("T")[0];
      });
      const labels = label.reverse().splice(-10);

      const datosY = datosGrafico.serie.map((ejeY) => {
        const valorEjeY = ejeY.valor;
        return Number(valorEjeY);
      });
      const data = datosY.reverse().splice(-10);
      const datasets = [
        {
          label: "Movimiento últimos 10 días " + monedaSeleccionada.value,
          borderColor: "rgb(4, 60, 78)",
          data,
        },
      ];

      return { labels, datasets };
    } catch (error) {
      alert("No se lograron cargar los datos");
    }
  }

  async function renderGrafica() {
    const data = await cargaDatosParaGrafico();

    const config = {
      type: "line",
      data,
    };
    miGraf.style.backgroundColor = "white";

    if (myChart) {
      myChart.destroy();
    }
    myChart = new Chart(miGraf, config);
  }

  renderGrafica();
}
