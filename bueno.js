const inputKcHtml = document.getElementById('input-kc')
const inputZ1Html = document.getElementById('input-z1')
const inputZ2Html = document.getElementById('input-z2')
const inputPHtml = document.getElementById('input-p')

const btnHtml = document.getElementById('btn-calcular')

btnHtml.addEventListener('click', (e) => {
  e.preventDefault()

  calcular(
    Number(inputKcHtml.value),
    Number(inputZ1Html.value),
    Number(inputZ2Html.value),
    Number(inputPHtml.value)
  )
})

const outHtml = document.getElementById('out')

const btnMioHtml = document.getElementById('btn-calcular-mio')

btnMioHtml.addEventListener('click', (e) => {
  e.preventDefault()
  inputKcHtml.value = 71.68
  cambiarTamanioInput(inputKcHtml)
  inputZ1Html.value = 102926.92
  cambiarTamanioInput(inputZ1Html)
  inputZ2Html.value = 134981.12
  cambiarTamanioInput(inputZ2Html)
  inputPHtml.value = 329361.94
  cambiarTamanioInput(inputPHtml)

  btnHtml.click()
})

// const Kc = 71.68
// const Z1 = 102926.92
// const Z2 = 134981.12
// const P = 329361.94

// const Kc = 2.67
// const Z1 = 166000
// const Z2 = 40100
// const P = 64092.85

const componentes = {}

function calcular(Kc, Z1, Z2, P) {
  //! Calculo de A, B, C y D

  const A = Kc
  const B = (Z1 + Z2) * Kc
  const C = Z1 * Z2 * Kc
  const D = P

  outHtml.innerText = ``

  //! Condiciones de NO negatividad

  const primeraCondicion = B > C / D
  const segundaCondicion = A + C / D ** 2 > B / D

  outHtml.innerHTML += `
  <p> 
  Primera condicion: B > C / D: <span class="${
    primeraCondicion ? 'cond-bien' : 'cond-mal'
  }">${primeraCondicion}</span></p><p>
  Segunda condicion: A + C / (D^2) > B / D: <span class="${
    segundaCondicion ? 'cond-bien' : 'cond-mal'
  }">${segundaCondicion}</span></p>
  `

  if (!primeraCondicion || !segundaCondicion) {
    return
  }

  //! Calculo de Cd y Rd1

  const valComponentes = [
    1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2,
  ]

  let error = Infinity

  valComponentes.forEach((Cd) => {
    const Rd1Real = 1 / (D * Cd)
    let exponente = Math.floor(Math.log10(Math.abs(Rd1Real)))

    let Rd1RealNormalizado = Rd1Real * 10 ** (exponente * -1)

    if (Rd1RealNormalizado > 9.1) {
      Rd1RealNormalizado /= 10
      exponente++
    }

    const Rd1Comercial = valComponentes.reduce((a, b) =>
      Math.abs(b - Rd1RealNormalizado) < Math.abs(a - Rd1RealNormalizado)
        ? b
        : a
    )

    if (Math.abs(Rd1Comercial - Rd1RealNormalizado) < error) {
      error = Math.abs(Rd1Comercial - Rd1RealNormalizado)
      componentes.Rd1 = Rd1Comercial * 1000
      componentes.Cd = Cd * 10 ** (exponente - 3)
    }
  })

  //! Calculo de Ci y Ri

  error = Infinity

  valComponentes.forEach((Ci) => {
    const RiReal = D / (C * Ci)

    let exponente = Math.floor(Math.log10(Math.abs(RiReal)))

    let RiRealNormalizado = RiReal * 10 ** (exponente * -1)

    if (RiRealNormalizado > 9.1) {
      RiRealNormalizado /= 10
      exponente++
    }

    const RiComercial = valComponentes.reduce((a, b) =>
      Math.abs(b - RiRealNormalizado) < Math.abs(a - RiRealNormalizado) ? b : a
    )

    if (Math.abs(RiComercial - RiRealNormalizado) < error) {
      error = Math.abs(RiComercial - RiRealNormalizado)
      componentes.Ri = RiComercial * 1000
      componentes.Ci = Ci * 10 ** (exponente - 3)
    }
  })

  componentes.Ci *= 10
  componentes.Ri /= 10

  //! Calculo de R1 y R2

  error = Infinity

  valComponentes.forEach((R1) => {
    const R2Real = ((B - C / D) * R1) / D

    let exponente = Math.floor(Math.log10(Math.abs(R2Real)))

    let R2RealNormalizado = R2Real * 10 ** (exponente * -1)

    if (R2RealNormalizado > 9.1) {
      R2RealNormalizado /= 10
      exponente++
    }

    const R2Comercial = valComponentes.reduce((a, b) =>
      Math.abs(b - R2RealNormalizado) < Math.abs(a - R2RealNormalizado) ? b : a
    )

    if (Math.abs(R2Comercial - R2RealNormalizado) < error) {
      error = Math.abs(R2Comercial - R2RealNormalizado)
      componentes.R2 = R2Comercial* 10 ** exponente
      componentes.R1 = R1 
    }
  })

  //! Calculo de Rd2

  const Rd2Real = ((A + C / D ** 2 - B / D) * 1) / (D * componentes.Cd)
  let exponente = Math.floor(Math.log10(Math.abs(Rd2Real)))
  let Rd2RealNormalizado = Rd2Real * 10 ** (exponente * -1)
  if (Rd2RealNormalizado > 9.1) {
    Rd2RealNormalizado /= 10
    exponente++
  }
  componentes.Rd2 =
    valComponentes.reduce((a, b) =>
      Math.abs(b - Rd2RealNormalizado) < Math.abs(a - Rd2RealNormalizado)
        ? b
        : a
    ) *
    10 ** exponente

  error = Math.abs(Rd2RealNormalizado - componentes.Rd2 / 10 ** exponente)

  outHtml.innerHTML += `
  <div class="container-resistencias">
    ${crearElementoComponente('R1', componentes.R1, true)}
    ${crearElementoComponente('R2', componentes.R2, true)}
    ${crearElementoComponente('Ri', componentes.Ri, true)}
    ${crearElementoComponente('Ci', componentes.Ci, false)}
    ${crearElementoComponente('Rd1', componentes.Rd1, true)}
    ${crearElementoComponente('Rd2', componentes.Rd2, true)}
    ${crearElementoComponente('Cd', componentes.Cd, false)}
  </div>
  `

  const ANuevo =
    componentes.Rd2 / componentes.Rd1 + componentes.R2 / componentes.R1
  const BNuevo =
    1 / (componentes.Ri * componentes.Ci) +
    componentes.R2 / (componentes.R1 * componentes.Rd1 * componentes.Cd)
  const CNuevo =
    1 / (componentes.Ri * componentes.Ci * componentes.Rd1 * componentes.Cd)
  const DNuevo = 1 / (componentes.Rd1 * componentes.Cd)

  const AError = Math.abs(A - ANuevo)
  const BError = Math.abs(B - BNuevo)
  const CError = Math.abs(C - CNuevo)
  const DError = Math.abs(D - DNuevo)

  const AErrorPor = (Math.abs(ANuevo - A) / Math.abs(A)) * 100
  const BErrorPor = (Math.abs(BNuevo - B) / Math.abs(B)) * 100
  const CErrorPor = (Math.abs(CNuevo - C) / Math.abs(C)) * 100
  const DErrorPor = (Math.abs(DNuevo - D) / Math.abs(D)) * 100

  outHtml.innerHTML += `
    <table border="1" class="tabla-valores">
<thead>
  <tr>
    <th></th>
    <th>Pasado</th>
    <th>Nuevo</th>
    <th>Error</th>
    <th>Error%</th>
  </tr></thead>
<tbody>
  <tr>
    <td style="text-align: center;">A</td>
    <td>${A.toFixed(2)}</td>
    <td>${ANuevo.toFixed(2)}</td>
    <td>${AError.toFixed(2)}</td>
    <td>${AErrorPor.toFixed(2)}%</td>
  </tr>
  <tr>
    <td style="text-align: center;">B</td>
    <td>${B.toFixed(2)}</td>
    <td>${BNuevo.toFixed(2)}</td>
    <td>${BError.toFixed(2)}</td>
    <td>${BErrorPor.toFixed(2)}%</td>
  </tr>
  <tr>
    <td style="text-align: center;">C</td>
    <td>${C.toFixed(2)}</td>
    <td>${CNuevo.toFixed(2)}</td>
    <td>${CError.toFixed(2)}</td>
    <td>${CErrorPor.toFixed(2)}%</td>
  </tr>
  <tr>
    <td style="text-align: center;">D</td>
    <td>${D.toFixed(2)}</td>
    <td>${DNuevo.toFixed(2)}</td>
    <td>${DError.toFixed(2)}</td>
    <td>${DErrorPor.toFixed(2)}%</td>
  </tr>
</tbody>
</table>
  `

  const resultadoCuadratica = resolverEcuacionCuadratica(
    1,
    BNuevo / ANuevo,
    CNuevo / ANuevo
  )

  if ('x1' in resultadoCuadratica) {
    outHtml.innerHTML += `
    <p>PID final:</p>
    <div class="pid-final"> 
    <div class="container-input">
      <div class="container-numerador">
        <p class="txt">${ANuevo.toFixed(2)} ∙ (s + ${(
      resultadoCuadratica.x1 * -1
    ).toFixed(2)}) ∙ (s + ${(resultadoCuadratica.x2 * -1).toFixed(2)})</p>
      </div>
      <div class="linea-divisora"></div>
      <div class="container-denominador">
        s ∙ (s + ${DNuevo.toFixed(2)})
      </div>
    </div>
    </div>
    `
  } else {
    if ('x' in resultadoCuadratica) {
      outHtml.innerHTML += `
      Unica raiz: ${resultadoCuadratica.x}
      `
    } else {
      outHtml.innerHTML += `
      Raices imaginarias: 
      X1: ${resultadoCuadratica.x1Real} ${resultadoCuadratica.x1Imaginario}i
      X2: ${resultadoCuadratica.x2Real} ${resultadoCuadratica.x2Imaginario}i
      `
    }
  }
}

function cambiarTamanioInput(html) {
  const length = html.value.length || 1
  html.style.width = `${length + 4}ch`
}

const input = Array(...document.getElementsByClassName('input'))
input.forEach((input) => {
  input.addEventListener('input', () => {
    cambiarTamanioInput(input)
  })
})

function resolverEcuacionCuadratica(a, b, c) {
  let resultado = {}
  // 1. Calcular el discriminante
  const discriminante = b * b - 4 * a * c

  // 2. Determinar las raíces según el discriminante
  if (discriminante > 0) {
    // Dos raíces reales y diferentes
    const x1 = (-b + Math.sqrt(discriminante)) / (2 * a)
    const x2 = (-b - Math.sqrt(discriminante)) / (2 * a)
    resultado = { x1: x1, x2: x2 }
  } else if (discriminante === 0) {
    // Una raíz real (o dos raíces reales iguales)
    const x = -b / (2 * a)
    resultado = { x: x }
  } else {
    // Raíces complejas
    // Esto requiere manejar números imaginarios, que se pueden representar
    // indicando el discriminante negativo y la unidad imaginaria 'i'
    const parteReal = -b / (2 * a)
    const parteImaginaria = Math.sqrt(Math.abs(discriminante)) / (2 * a)
    resultado = {
      x1Real: parteReal,
      x1Imaginario: parteImaginaria,
      x2Real: parteReal,
      x2Imaginario: parteImaginaria * -1,
    }
  }
  return resultado
}

function generarNombreComponente(valor, esResistencia = true) {
  const prefijos = [
    { limite: 1e12, simbolo: 'T' },
    { limite: 1e9, simbolo: 'G' },
    { limite: 1e6, simbolo: 'M' },
    { limite: 1e3, simbolo: 'k' },
    { limite: 1, simbolo: '' },
    { limite: 1e-3, simbolo: 'm' },
    { limite: 1e-6, simbolo: 'µ' },
    { limite: 1e-9, simbolo: 'n' },
    { limite: 1e-12, simbolo: 'p' },
  ]

  const unidad = esResistencia ? 'Ω' : 'F'

  for (let i = 0; i < prefijos.length; i++) {
    const { limite, simbolo } = prefijos[i]
    if (Math.abs(valor) >= limite) {
      let num = valor / limite
      // Redondeamos a máximo 3 cifras significativas
      num = parseFloat(num.toPrecision(3))
      return `${num}${simbolo}${unidad}`
    }
  }
}

function crearElementoComponente(nombre, valor, esResistencia = true) {
  const id = `${nombre}-valor`
  const valorFormateado = generarNombreComponente(valor, esResistencia)

  return `
    <div class="componente">
      <span>${nombre}: </span>
      <span class="valor" id="${id}" data-valor="${valor}" data-esres="${esResistencia}">
        ${valorFormateado}
      </span>
      <button class="boton-flecha" onclick="ajustarValor('${id}', 10)">⬆️</button>
      <button class="boton-flecha" onclick="ajustarValor('${id}', 0.1)">⬇️</button>
    </div>
  `
}

function ajustarValor(id, factor, soloComponente = false) {
  const span = document.getElementById(id)
  let valor = parseFloat(span.dataset.valor)
  const valorOriginal = valor
  if (valor < 10e-12 && factor == 0.1) return false
  const esResistencia = span.dataset.esres === 'true'

  // Multiplicamos o dividimos
  if (factor > 1) valor *= factor
  else valor *= factor

  if (!soloComponente) {
    const nombreComponente = id.split('-')[0]

    switch (nombreComponente) {
      case 'R1':
        if (!ajustarValor('R2-valor', factor, true)) return
        break
      case 'R2':
        if (!ajustarValor('R1-valor', factor, true)) return
        break
      case 'Ri':
        if (!ajustarValor('Ci-valor', factor == 10 ? 0.1 : 10, true)) return
        break
      case 'Ci':
        if (!ajustarValor('Ri-valor', factor == 10 ? 0.1 : 10, true)) return
        break
      case 'Rd1':
        if (!ajustarValor('Rd2-valor', factor, true)) return

        if (!ajustarValor('Cd-valor', factor == 10 ? 0.1 : 10, true)) {
          ajustarValor('Rd2-valor', factor == 10 ? 0.1 : 10, true)
          return
        }
        break
      case 'Rd2':
        if (!ajustarValor('Rd1-valor', factor, true)) return

        if (!ajustarValor('Cd-valor', factor == 10 ? 0.1 : 10, true)) {
          ajustarValor('Rd1-valor', factor == 10 ? 0.1 : 10, true)
          return
        }
        break
      case 'Cd':
        if (!ajustarValor('Rd1-valor', factor == 10 ? 0.1 : 10, true)) return

        if (!ajustarValor('Rd2-valor', factor == 10 ? 0.1 : 10, true)) {
          ajustarValor('Rd1-valor', factor, true)
          return
        }
        break
    }
  }

  // Guardamos el nuevo valor y actualizamos el texto
  span.dataset.valor = valor
  span.textContent = generarNombreComponente(valor, esResistencia)
  return true
}
