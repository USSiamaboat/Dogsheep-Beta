let svlt = []

// Settings
const MAX_ROOT = 100
const MAX_LOG = 100

// Constants
const powers = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
const logs = [2, 3, 4, 5, 6, 7, 8, 9, 10]
const roots = [2, 3, 4]

// Primes
let primes = []

for (let i = 2; i <= MAX_LOG; i++) {
    let foundDivisor = false
    const upperBound = Math.sqrt(i)

    for (const p of primes) {
        if (p > upperBound) break
        if (i % p != 0) continue
        foundDivisor = true
    }

    if (foundDivisor) continue

    primes.push(i)
}

// Main
function generateSvlt() {
    // Roots
    generateRoots()

    // Logs
    generateSimpleLogs()

    // Constants
    generateConstant(Math.E, "e")
    generateConstant(Math.PI, "\\pi")
}

// Utility
function pushSvlt(value, latex) {
    svlt.push({
        "value": value,
        "latex": latex
    })
}

// Generation
function generateRoots() {
    for (const root of roots) {
        const cleanPowers = []
        const badPowers = []

        // Generate a list of numbers that, when rooted, are integers
        for (let x = 2; x <= Math.pow(MAX_ROOT, 1/root); x++) {
            cleanPowers.push(Math.pow(x, root))
        }

        // Returns if n is divisible by a "clean power"
        // aka can be simplified when rooted
        function hasCleanPower(n) {
            for (const clean of cleanPowers) {
                if (clean > n) return false
                if ((n % clean) == 0) return true
            }
            return true
        }

        // Generate a list of numbers that cannot be simplified when rooted
        for (let x = 2; x <= MAX_ROOT; x++) {
            if (hasCleanPower(x)) continue

            badPowers.push(x)
        }

        // Push all unsimplifiable numbers to the db
        for (const num of badPowers) {
            pushSvlt(
                value=Math.pow(num, 1/root),
                latex=`\\sqrt[${root}]{${num}}`
            )
        }
    }
}

// TODO: Add non-squarefree logs that cannot be simplified
//       (ex: log(12) = (2log(2) + log(3)))
function generateSimpleLogs() {
    // Check for squarefree
    function squareFree(x) {
        for (prime of primes) {
            if (x > prime**2) return true
            if (x % (prime**2) == 0) return false
        }

        return true
    }

    // Generate logs of squarefree integers
    for (const base of logs) {
        for (let x = 2; x <= MAX_LOG; x++) {
            if (!squareFree(x)) continue

            pushSvlt(Math.log(x)/Math.log(base), `\\log_{${base}}{${x}}`)
        }
    }

    // Natural log
    for (let x = 2; x <= MAX_LOG; x++) {
        if (!squareFree(x)) continue

        pushSvlt(Math.log(x), `\\ln{${x}}`)
    }
}

function generateConstant(c_value, c_latex) {
    // Base value
    pushSvlt(
        value=c_value,
        latex=c_latex
    )

    // Powers only
    for (const power of powers) {
        pushSvlt(
            value=Math.pow(c_value, power),
            latex=`${c_latex}^{${power}}`
        )
    }

    // Roots only
    for (const root of roots) {
        pushSvlt(
            value=Math.pow(c_value, 1/root),
            latex=`\\sqrt[${root}]{${c_latex}}`
        )
    }

    // Both
    for (const power of powers) {
        for (const root of roots) {
            if (((power % root) == 0) || ((root % power) == 0)) continue

            pushSvlt(
                value=Math.pow(c_value, power/root),
                latex=`\\sqrt[${root}]{${c_latex}^{${power}}}`
            )
        }
    }
}

// Run
generateSvlt()
