const inputKcHtml = document.getElementById('input-kc')
const inputZ1Html = document.getElementById('input-z1')
const inputZ2Html = document.getElementById('input-z2')
const inputPHtml = document.getElementById('input-p')

const btnHtml = document.getElementById('btn-calcular')

btnHtml.addEventListener('click', (e) => {
  e.preventDefault()

  console.log(inputKcHtml.value)
  console.log(inputZ1Html.value)
  console.log(inputZ2Html.value)
  console.log(inputPHtml.value)

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

  if (primeraCondicion) {
    console.log('Primera condicion: ' + primeraCondicion)
  } else {
    console.error('Primera condicion: ' + primeraCondicion)
  }

  if (segundaCondicion) {
    console.log('Segunda condicion: ' + segundaCondicion)
  } else {
    console.error('Segunda condicion: ' + segundaCondicion)
  }

  if (!primeraCondicion || !segundaCondicion) {
    return
  }

  // console.log('----------------')

  //! Calculo de Cd y Rd1

  const valComponentes = [
    1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2,
  ]

  const componentes = {}
  let error = Infinity

  valComponentes.forEach((Cd) => {
    const Rd1Real = 1 / (D * Cd)

    const exponente = Math.floor(Math.log10(Math.abs(Rd1Real)))

    const Rd1RealNormalizado = Rd1Real * 10 ** (exponente * -1)

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

  // console.log('Cd: ' + componentes.Cd)
  // console.log('Rd1: ' + componentes.Rd1)
  // console.log('Error Rd1: ' + error)

  // console.log('----------------')

  //! Calculo de Ci y Ri

  error = Infinity

  valComponentes.forEach((Ci) => {
    const RiReal = D / (C * Ci)

    const exponente = Math.floor(Math.log10(Math.abs(RiReal)))

    const RiRealNormalizado = RiReal * 10 ** (exponente * -1)

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

  console.log('Ci: ' + componentes.Ci)
  console.log('Ri: ' + componentes.Ri)
  console.log('Error Ri: ' + error)

  console.log('----------------')

  //! Calculo de R1 y R2

  error = Infinity

  valComponentes.forEach((R1) => {
    const R2Real = ((B - C / D) * R1) / D

    const exponente = Math.floor(Math.log10(Math.abs(R2Real)))

    const R2RealNormalizado = R2Real * 10 ** (exponente * -1)

    const R2Comercial = valComponentes.reduce((a, b) =>
      Math.abs(b - R2RealNormalizado) < Math.abs(a - R2RealNormalizado) ? b : a
    )

    if (Math.abs(R2Comercial - R2RealNormalizado) < error) {
      error = Math.abs(R2Comercial - R2RealNormalizado)
      componentes.R2 = R2Comercial * 10000
      componentes.R1 = R1 * 10 ** exponente
    }
  })

  console.log('R1: ' + componentes.R1)
  console.log('R2: ' + componentes.R2)
  console.log('Error R2: ' + error)

  console.log('----------------')

  //! Calculo de Rd2

  const Rd2Real = ((A + C / D ** 2 - B / D) * 1) / (D * componentes.Cd)
  const exponente = Math.floor(Math.log10(Math.abs(Rd2Real)))
  const Rd2RealNormalizado = Rd2Real * 10 ** (exponente * -1)
  componentes.Rd2 =
    valComponentes.reduce((a, b) =>
      Math.abs(b - Rd2RealNormalizado) < Math.abs(a - Rd2RealNormalizado)
        ? b
        : a
    ) *
    10 ** exponente

  error = Math.abs(Rd2RealNormalizado - componentes.Rd2 / 10 ** exponente)

  console.log('Rd2: ' + componentes.Rd2)
  console.log('Error Rd2: ' + error)

  console.log('----------------')

  outHtml.innerHTML += `
  <p class="container-resistencias">
  <span>R1: ${generarNombreComponente(componentes.R1)}</span>
  <span>R2: ${generarNombreComponente(componentes.R2)}</span>
  <span>Ri: ${generarNombreComponente(componentes.Ri)}</span>
  <span>Ci: ${generarNombreComponente(componentes.Ci, false)}</span>
  <span>Rd1: ${generarNombreComponente(componentes.Rd1)}</span>
  <span>Rd2: ${generarNombreComponente(componentes.Rd2)}</span>
  <span>Cd: ${generarNombreComponente(componentes.Cd, false)}</span>
  </p>
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

  console.log('A nuevo: ' + ANuevo)
  console.log('B nuevo: ' + BNuevo)
  console.log('C nuevo: ' + CNuevo)
  console.log('D nuevo: ' + DNuevo)

  console.log(
    'Error A: ' +
      Math.abs(A - ANuevo) +
      ' | ' +
      (Math.abs(ANuevo - A) / Math.abs(A)) * 100 +
      '%'
  )
  console.log(
    'Error B: ' +
      Math.abs(B - BNuevo) +
      ' | ' +
      (Math.abs(BNuevo - B) / Math.abs(B)) * 100 +
      '%'
  )
  console.log(
    'Error C: ' +
      Math.abs(C - CNuevo) +
      ' | ' +
      (Math.abs(CNuevo - C) / Math.abs(C)) * 100 +
      '%'
  )
  console.log(
    'Error D: ' +
      Math.abs(D - DNuevo) +
      ' | ' +
      (Math.abs(DNuevo - D) / Math.abs(D)) * 100 +
      '%'
  )

  outHtml.innerHTML += `
    <table border="1">
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
      outHtml.innerText += `
      Unica raiz: ${resultadoCuadratica.x}
      `
    } else {
      outHtml.innerText += `
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

  const unidad = esResistencia ? "Ω" : "F"

  for (let i = 0; i < prefijos.length; i++) {
    const { limite, simbolo } = prefijos[i]
    if (Math.abs(valor) >= limite) {
      let num = valor / limite
      // Redondeamos a máximo 3 cifras significativas
      num = parseFloat(num.toPrecision(3))
      return `${num}${simbolo}${unidad}`
    }
  }

  const exponente = Math.floor(Math.log10(Math.abs(valor)))
}
