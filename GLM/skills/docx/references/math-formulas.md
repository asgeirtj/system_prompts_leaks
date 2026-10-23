# Math Formulas — LaTeX → docx-js Mapping

## Design Philosophy

GLM uses **LaTeX as the formula input syntax**, internally converting to docx-js Math objects.

**Why not write OMML directly?**
- Models are naturally proficient in LaTeX (abundant in training data)
- LaTeX is semantically clear and highly readable
- Conversion layer is encapsulated internally, transparent to the user

## Quick Start

```js
const { Math: OoxmlMath, MathRun, MathFraction, MathSuperScript,
        MathSubScript, MathRadical, MathSum, MathSubSuperScript } = require("docx");

// Embed formula in paragraph
new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [
    new OoxmlMath({
      children: [/* Math components */]
    })
  ]
})
```

## LaTeX → docx-js Conversion Table

### Basic Operations

| LaTeX | Meaning | docx-js Implementation |
|-------|---------|----------------------|
| `x + y` | Addition | `new MathRun("x + y")` |
| `x - y` | Subtraction | `new MathRun("x − y")` (use Unicode minus `−`) |
| `x \times y` | Multiplication | `new MathRun("x × y")` |
| `x \div y` | Division | `new MathRun("x ÷ y")` |
| `x \pm y` | Plus-minus | `new MathRun("x ± y")` |
| `x \neq y` | Not equal | `new MathRun("x ≠ y")` |
| `x \leq y` | Less or equal | `new MathRun("x ≤ y")` |
| `x \geq y` | Greater or equal | `new MathRun("x ≥ y")` |

### Fractions

| LaTeX | docx-js |
|-------|---------|
| `\frac{a}{b}` | `new MathFraction({ numerator: [new MathRun("a")], denominator: [new MathRun("b")] })` |
| `\frac{x+1}{x-1}` | `new MathFraction({ numerator: [new MathRun("x+1")], denominator: [new MathRun("x−1")] })` |

### Superscripts & Subscripts

| LaTeX | docx-js |
|-------|---------|
| `x^2` | `new MathSuperScript({ children: [new MathRun("x")], superScript: [new MathRun("2")] })` |
| `x_i` | `new MathSubScript({ children: [new MathRun("x")], subScript: [new MathRun("i")] })` |
| `x_i^2` | `new MathSubSuperScript({ children: [new MathRun("x")], subScript: [new MathRun("i")], superScript: [new MathRun("2")] })` |

### Radicals

| LaTeX | docx-js |
|-------|---------|
| `\sqrt{x}` | `new MathRadical({ children: [new MathRun("x")] })` |
| `\sqrt[3]{x}` | `new MathRadical({ children: [new MathRun("x")], degree: [new MathRun("3")] })` |

### Summation & Integrals

| LaTeX | docx-js |
|-------|---------|
| `\sum_{i=1}^{n}` | `new MathSum({ subScript: [new MathRun("i=1")], superScript: [new MathRun("n")], children: [new MathRun("aᵢ")] })` |

### Greek Letters

Use Unicode characters directly:

```js
// LaTeX → Unicode mapping
const GREEK = {
  "\\alpha": "α", "\\beta": "β", "\\gamma": "γ", "\\delta": "δ",
  "\\epsilon": "ε", "\\zeta": "ζ", "\\eta": "η", "\\theta": "θ",
  "\\iota": "ι", "\\kappa": "κ", "\\lambda": "λ", "\\mu": "μ",
  "\\nu": "ν", "\\xi": "ξ", "\\pi": "π", "\\rho": "ρ",
  "\\sigma": "σ", "\\tau": "τ", "\\phi": "φ", "\\chi": "χ",
  "\\psi": "ψ", "\\omega": "ω",
  "\\Alpha": "Α", "\\Beta": "Β", "\\Gamma": "Γ", "\\Delta": "Δ",
  "\\Theta": "Θ", "\\Lambda": "Λ", "\\Pi": "Π", "\\Sigma": "Σ",
  "\\Phi": "Φ", "\\Psi": "Ψ", "\\Omega": "Ω",
};
```

## Complete Formula Examples

### Quadratic Formula

LaTeX: `x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}`

```js
new OoxmlMath({
  children: [
    new MathRun("x = "),
    new MathFraction({
      numerator: [
        new MathRun("−b ± "),
        new MathRadical({
          children: [
            new MathSuperScript({
              children: [new MathRun("b")],
              superScript: [new MathRun("2")],
            }),
            new MathRun(" − 4ac"),
          ],
        }),
      ],
      denominator: [new MathRun("2a")],
    }),
  ],
})
```

### Pythagorean Theorem

LaTeX: `a^2 + b^2 = c^2`

```js
new OoxmlMath({
  children: [
    new MathSuperScript({ children: [new MathRun("a")], superScript: [new MathRun("2")] }),
    new MathRun(" + "),
    new MathSuperScript({ children: [new MathRun("b")], superScript: [new MathRun("2")] }),
    new MathRun(" = "),
    new MathSuperScript({ children: [new MathRun("c")], superScript: [new MathRun("2")] }),
  ],
})
```

### Trigonometric Identity

LaTeX: `\sin^2\theta + \cos^2\theta = 1`

```js
new OoxmlMath({
  children: [
    new MathSuperScript({ children: [new MathRun("sin")], superScript: [new MathRun("2")] }),
    new MathRun("θ + "),
    new MathSuperScript({ children: [new MathRun("cos")], superScript: [new MathRun("2")] }),
    new MathRun("θ = 1"),
  ],
})
```

## Common Exam Formula Templates

### Middle School Math

```js
// Quadratic discriminant
const discriminant = new OoxmlMath({
  children: [
    new MathRun("Δ = "),
    new MathSuperScript({ children: [new MathRun("b")], superScript: [new MathRun("2")] }),
    new MathRun(" − 4ac"),
  ],
});

// Circle area
const circleArea = new OoxmlMath({
  children: [
    new MathRun("S = π"),
    new MathSuperScript({ children: [new MathRun("r")], superScript: [new MathRun("2")] }),
  ],
});
```

### High School Math

```js
// Logarithm change of base
const logChange = new OoxmlMath({
  children: [
    new MathSubScript({ children: [new MathRun("log")], subScript: [new MathRun("a")] }),
    new MathRun("b = "),
    new MathFraction({
      numerator: [new MathRun("ln b")],
      denominator: [new MathRun("ln a")],
    }),
  ],
});

// Arithmetic series sum
const arithmeticSum = new OoxmlMath({
  children: [
    new MathSubScript({ children: [new MathRun("S")], subScript: [new MathRun("n")] }),
    new MathRun(" = "),
    new MathFraction({
      numerator: [
        new MathRun("n("),
        new MathSubScript({ children: [new MathRun("a")], subScript: [new MathRun("1")] }),
        new MathRun(" + "),
        new MathSubScript({ children: [new MathRun("a")], subScript: [new MathRun("n")] }),
        new MathRun(")"),
      ],
      denominator: [new MathRun("2")],
    }),
  ],
});
```

### Physics

```js
// Newton's second law
const newton2 = new OoxmlMath({
  children: [new MathRun("F = ma")],
});

// Kinetic energy
const kineticEnergy = new OoxmlMath({
  children: [
    new MathSubScript({ children: [new MathRun("E")], subScript: [new MathRun("k")] }),
    new MathRun(" = "),
    new MathFraction({
      numerator: [new MathRun("1")],
      denominator: [new MathRun("2")],
    }),
    new MathRun("m"),
    new MathSuperScript({ children: [new MathRun("v")], superScript: [new MathRun("2")] }),
  ],
});
```

## Complexity Fallback Strategy

When formulas are too complex (nesting >3 levels) for docx-js Math, **fall back to matplotlib PNG rendering:**

```python
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

def latex_to_png(latex_str: str, output_path: str, fontsize: int = 14, dpi: int = 200):
    """Render LaTeX formula as PNG image"""
    fig, ax = plt.subplots(figsize=(0.1, 0.1))
    ax.axis("off")
    text = ax.text(0, 0.5, f"${latex_str}$", fontsize=fontsize,
                   transform=ax.transAxes, verticalalignment="center")

    fig.canvas.draw()
    bbox = text.get_window_extent(fig.canvas.get_renderer())
    fig.set_size_inches(bbox.width / dpi + 0.2, bbox.height / dpi + 0.2)

    plt.savefig(output_path, dpi=dpi, bbox_inches="tight",
                pad_inches=0.05, transparent=True)
    plt.close()
    return output_path
```

Then embed the PNG in the document:

```js
const formulaImg = fs.readFileSync("formula.png");
new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new ImageRun({
    data: formulaImg,
    transformation: { width: 300, height: 40 }, // adjust based on actual size
    type: "png",
  })],
})
```

**Fallback rules:**
- Nested fractions >2 levels → fallback
- Matrices/determinants → fallback
- Complex integrals (multiple integrals + limits + integrand) → fallback
- Piecewise functions → fallback
- All other cases → prefer docx-js Math
