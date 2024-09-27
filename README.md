# Dogsheep Beta

Computational guessing program for evaluating a subset of "simple" math expressions

## Motivation

Sometimes, computer systems fail to produce an exact value when evaluating difficult math expressions. They can, however, almost always produce a decimal approximation. In some cases, this decimal approximation can just "feel like" a certain value. For example, $1.7071\ldots$ feels like (and is also the first few digits of) $\frac{\sqrt{2}}{2} + 1$.

Dogsheep attempts to replicate this guessing approach to finding exact value solutions.

## Approach

### From expression to "precise" decimals

The task of converting any expression, which could be anything from an integer to an integral, is difficult. However, it is solved (in nearly all reasonable use cases) with the numerical estimation algorithms in the Desmos API.

Dogsheep "preprocesses" LaTeX expressions through Desmos estimator to obtain a decimal with approximately 15 decimal places of precision.

### Continued fractions for optimal approximation

The iterative algorithm for finding the simple continued fraction representation of any known value produces a *convergent* after each iteration. These *convergents* are known to be a better fractional approximation than any other fraction with a lesser denominator. This can be roughly interpreted to mean convergents are the "best" approximations for similarly sized and smaller (referring to the size of the numerator and denominator) fractions.

This property is useful for finding the exact fractional if the decimal computed earlier if it exists. However, the limited precision of the decimal also limits the accuracy of convergence with continued fractions. As a result, Dogsheep limits the fraction size to a maximum of 4-digit denominators.

This approach is still limited to only estimating rational numbers, which is not very useful because there exist fast and accurate methods of always obtaining the correct rational simplification if it exists.

### Special value lookup table with convergent bashing

Dogsheep computes a lookup table of special values, which includes powers and of common irrational numbers like $e$
and $\pi$ and stores their decimal approximations.

The Dogsheep algorithm checks every value of this lookup table and uses convergents of continued fraction approximations to determine the "best" coefficients for the exact values. The remainder is also approximated using continued fractions and the sum of the 2 terms is optimized the minimize the difference with the target decimal value.

This partially solves the domain issue with using only continued fractions. Interestingly, this is enough to solve the majority of difficult expression evaluations found in introductory calculus classrooms.

## Wolfram Alpha competitor?

Not even close.

Wolfram has its own exact value estimator: simply asking for the "closed form" usually yields very good results.

### However...

#### 1. Edge cases!

Asking Wolfram to evaluate $\int_0^{\frac{\pi}{2}}{\frac{1}{1 + (\cot(x))^\frac{7}{2}}dx}$ yields $0.785398$. Asking for the closed form prompts a long wait that doesn't produce a result at all.

Dogsheep arrives at the correct answer ($\frac{\pi}{4}$) in a few seconds.

#### 2. Speed (sometimes)

Wolfram can sometimes be slow when asking for the closed form of a difficult integral. Dogsheep will usually (when given integrals that you might find in a calculus class) evaluate correctly relatively quickly.

#### 3. Novelty

With the knowledge of Dogsheep's questionable accuracy, it can be very interesting to see how a guessing algorithm designed with a high-school understanding of math can achieve an unreasonable level of accuracy on a variety of problems.

My favorite example is the famous Gaussian integral $\int_{-\infty}^\infty \exp(-x^2)dx$, which Dogsheep correctly guesses as $\sqrt{\pi}$ with very little calculus knowledge.

## Naming

Wolfram Alpha

-> Wolf Ram Alpha

*Note:* Wolf ~ Dog, Ram ~ Sheep, Alpha ~ Beta

-> Dog Sheep Beta

## Design

This website is purposefully designed to indicate a lack of professionalism to deter people from blindly trusting potentially incorrect results.

The general design patterns, like the name, can be interpreted as a parody of the Wolfram Alpha design.

## Acknowledgements

This project uses MathQuill for LaTeX inputs and display.

This project uses Desmos API for numerical evaluation of LaTeX inputs.

The algorithm was ultimately motivated by the oral presentation topic for NSML Meet 2 in the 2023-2024 season.