// Config
const MAX_ITER = 50
const DIGITS = 14 // Keep < 16
const MAX_FRAC_SIZE = 20
const FRAC_MAX = 10
const CONV_SIZE = 4

// Math
function rounded(n) {
    return Number(n.toPrecision(DIGITS))
}

function gcd(a, b) {
    // Euclidean algorithm
    if (b == 0) return a
    return gcd(b, a%b)
}

class Fraction {
    // Standard fraction approximation

    constructor(x) {
        // Basic info
        this.val = rounded(x)
        this.sign = (x >= 0) ? 1 : -1
        x *= this.sign

        // Initial fraction
        const fracPart = x - Math.floor(x)
        let num = x
        let den = 1

        // Skip integer
        if (fracPart == 0) return

        // Require integer numerator, denominator
        const decDigits = -Math.floor(Math.log10(fracPart))

        den = 10**decDigits
        num *= den

        // Simplify
        const factor = gcd(num, den)
        num /= factor
        den /= factor

        // Derived info
        this.num = num
        this.den = den
    }
}

class CFraction {
    // Continued fraction approximation

    constructor(x) {
        // Basic info
        this.val = rounded(x)
        this.sign = (x >= 0) ? 1 : -1
        x *= this.sign

        // Compute partial quotients
        let frac = []
        
        while (frac.length < MAX_FRAC_SIZE) {
            // Find integral part
            const a = Math.floor(x)
            frac.push(a)

            // Find fractional part
            const fracPart = x - a

            if (fracPart < 10**(-10)) break // Approx threshold + float error correct

            // Update remainder
            x = 1/fracPart
        }

        // Coerce compact fraction
        if ((frac[frac.length-1] == 1) && (frac.length > 1)) {
            frac[frac.length-2] = frac[frac.length-2] + 1
            frac.pop()
        }

        // Derived info
        this.frac = frac
        this.length = frac.length
        this.fracVal = rounded(this.getFracVal())
        this.simpleFrac = this.getSimpleFrac()
    }

    getFracVal() {
        // Returns the fraction's estimate of the decimal value
        let curr = this.frac[0]

        for (let i = this.length-2; i >= 0; i--) {
            curr = this.frac[i] + 1/curr
        }

        return curr * this.sign
    }

    getSimpleFrac() {
        // Returns the exact conversion into a simple improper fraction
        return this._getSimpleFrac(this.frac, this.sign)
    }

    _getSimpleFrac(_frac, sign) {
        // Returns the exact conversion of any continued fraction into a simple improper fraction
        let num = _frac[_frac.length-1]
        let den = 1

        for (let i = _frac.length-2; i >= 0; i--) {
            // Invert
            const temp = den
            den = num
            num = temp

            // Add
            const curr = _frac[i]
            num = den * curr + num

            // Simplify
            const factor = gcd(num, den)
            num /= factor
            den /= factor
        }

        return [sign*num, den]
    }

    getConvergent(maxDigits) {
        // Returns the closest convergent with limited denominator digits
        const first = this.frac[0]
        let frac = this.frac.map(x => x).splice(1)

        const isGood = x => x[1] < 10**maxDigits

        while (frac.length > 0) {
            if (isGood(this._getSimpleFrac(frac, 1))) break
            frac.pop()
        }

        const simple = this._getSimpleFrac([first].concat(frac), this.sign)

        if (isGood(simple)) return simple

        return [0, 1]
    }
}

function approximate(value) {
    bests = []
    best_error = parseFloat("Infinity")

    function updateBest(latex, error) {
        if (error < best_error) {
            bests = [latex]
            best_error = error
        } else if (error == best_error) {
            bests.push(latex)
        }
    }

    // Pure fraction
    {
        const frac = new CFraction(value).getConvergent(CONV_SIZE)
        let latex = `\\frac{${frac[0]}}{${frac[1]}}`

        if (frac[1] == 1) {
            latex = `${frac[0]}`
        }

        const est = frac[0]/frac[1]
        const error = Math.abs(value - est)

        updateBest(latex, error)
    }

    // Irrational in numerator
    const irNumLatex = (conv, symbol, num, den) => {
        let latex = ""

        // Sign
        if (conv[0]/conv[1] < 0) {
            latex += "-"
            conv = [Math.abs(conv[0]), Math.abs(conv[1])]
        }

        if (conv[0]/conv[1] == 1) {
            latex += `${symbol}`
        } else if (conv[1] == 1) {
            latex += `${conv[0]}${symbol}`
        } else if (conv[0] == 1) {
            latex += `\\frac{${symbol}}{${conv[1]}}`
        } else {
            latex += `\\frac{${conv[0]}${symbol}}{${conv[1]}}`
        }

        if (num == 0) return latex

        // Sign
        if (num/den < 0) {
            latex += "-"
        } else {
            latex += "+"
        }

        num = Math.abs(num)
        den = Math.abs(den)

        if (den == 1) return latex + num

        return latex + `\\frac{${num}}{${den}}`
    }

    for (let den = 1; den <= FRAC_MAX; den++) {
        for (let num = -FRAC_MAX; num <= FRAC_MAX; num++) {
            if (gcd(num, den) > 1) continue

            const x = value - num/den

            for (const sus of svlt) {
                const conv = new CFraction(x/sus.value).getConvergent(CONV_SIZE)
                const latex = irNumLatex(conv, sus.latex, num, den)
                const est = sus.value*conv[0]/conv[1] + num/den
                const error = Math.abs(value - est)

                updateBest(latex, error)
            }
        }
    }

    return({"bests": bests, "error": best_error})
}

// Mathquill
const MQ = MathQuill.getInterface(2)

const greek = "alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi omicron pi rho sigma tau upsilon phi chi psi omega"

let answerSpan = document.getElementById("input")
let resultSpan = document.getElementById("result")

let field = MQ.MathField(answerSpan, {
    spaceBehavesLikeTab: true,
    leftRightIntoCmdGoes: 'up',
    restrictMismatchedBrackets: true,
    sumStartsWithNEquals: true,
    supSubsRequireOperand: true,
    charsThatBreakOutOfSupSub: '+-=<>',
    autoSubscriptNumerals: true,
    autoCommands: greek + " sqrt sum frac int infty nthroot",
    autoOperatorNames: "log ln sin cos tan cot sec csc arcsin arccos arctan arccot arcsec arccsc",
    maxDepth: 10,
    handlers: {
        enter: async () => {
            const latex = field.latex()

            loadingResult()

            let numeric;
            let result;

            try {
                if (latex == "") throw Error()
                numeric = await evaluate(latex)
                result = approximate(numeric)
            } catch {
                errorResult()
                return
            }

            const bests = result["bests"]
            const error = result["error"]

            console.log(bests, error)

            if (error < 1e-15) {
                setResult(latex + "= \\quad " + bests[0])
            } else {
                const nString = numeric.toString().slice(0, 7)
                setResult(latex + " \\approx \\quad " + nString + " \\ldots " + " \\approx " + bests[0])
            }
        }
    }
})

function setResultClass(newClass) {
    resultSpan.className = newClass
}

function loadingResult() {
    setResultClass("waiting")
    resultSpan.innerHTML = "Computing results..."
}

function setResult(latex) {
    setResultClass("")
    resultSpan.innerHTML = latex
    MQ.StaticMath(resultSpan)
}

function errorResult() {
    setResultClass("failed")
    resultSpan.innerHTML = "Evaluation Failed"
}

function setDefaultText() {
    setResultClass("waiting")
    resultSpan.innerHTML = "e \\approx \\pi \\approx \\sqrt{g} \\approx 3"
    MQ.StaticMath(resultSpan)
}

setDefaultText()

// Desmos
const desmos = Desmos.HeadlessGraphingCalculator()

function asyncNumeric(exp) {
    // Makes a single attempt to get the computed expression value
    const tryNumber = (interval, resolve) => {
        if (isNaN(exp.numericValue)) return
        
        clearInterval(interval)
        resolve(exp.numericValue)
    }

    // Makes up to MAX_ITER attempts to get the computed expression value
    const makeAttempts = (resolve) => {
        let attempts = 0

        const interval = setInterval(
            () => {
                if (attempts == MAX_ITER) {
                    clearInterval(interval)
                    return resolve(NaN)
                }
                
                attempts += 1
                tryNumber(interval, resolve)
            },
            100
        )
    }

    // Wrap attempts in promise
    return new Promise(makeAttempts)
}

async function evaluate(latex_) {
    exp = desmos.HelperExpression({latex: latex_})

    return await asyncNumeric(exp)
}
