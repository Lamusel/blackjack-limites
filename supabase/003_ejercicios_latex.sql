-- ═══════════════════════════════════════════════════════════
-- Blackjack de Cálculo — 003_ejercicios_latex.sql
-- Reescribe TODOS los ejercicios con notación matemática real
-- (fracciones, límites, raíces, derivadas parciales…) que el
-- juego dibuja con KaTeX.
--   • Ejecútalo UNA vez en Supabase → SQL Editor → Run
--   • Borra los ejercicios viejos (incluidos los que generó la IA
--     con el formato anterior) y vuelve a cargar los 54 nuevos.
--   • Los nuevos que genere la IA ya vienen en este formato.
-- ═══════════════════════════════════════════════════════════

begin;

delete from exercises;

-- ── LÍMITES ───────────────────────────────────────────
insert into exercises (topic, difficulty, points, question, options, correct_answer, explanation, source) values
  ('limites', 'easy', 2, 'Calcula $$\lim_{x\to 2}\left(x^2+3x-1\right)$$',
   '["$9$", "$10$", "$11$", "$12$"]', '$9$',
   'Sustituimos $x=2$: $(2)^2+3(2)-1=4+6-1=9$', 'professor'),
  ('limites', 'easy', 2, 'Calcula $$\lim_{x\to 0}\left(\cos x+1\right)$$',
   '["$0$", "$1$", "$2$", "$3$"]', '$2$',
   'Sustituimos $x=0$: $\cos 0+1=1+1=2$', 'professor'),
  ('limites', 'medium', 4, 'Calcula $$\lim_{x\to 1}\frac{x^2-1}{x-1}$$',
   '["$0$", "$1$", "$2$", "No existe"]', '$2$',
   'Factorizamos $x^2-1=(x-1)(x+1)$ y simplificamos: $\lim_{x\to1}(x+1)=2$', 'professor'),
  ('limites', 'medium', 4, 'Calcula $$\lim_{x\to -2}\frac{x^2+5x+6}{x+2}$$',
   '["$-1$", "$0$", "$1$", "$2$"]', '$1$',
   'Factorizamos $x^2+5x+6=(x+2)(x+3)$ y simplificamos: $\lim_{x\to-2}(x+3)=1$', 'professor'),
  ('limites', 'hard', 6, 'Calcula $$\lim_{x\to 4}\frac{\sqrt{x}-2}{x-4}$$',
   '["$\\frac{1}{2}$", "$\\frac{1}{4}$", "$1$", "$4$"]', '$\frac{1}{4}$',
   'Multiplicamos por el conjugado: $\dfrac{x-4}{(x-4)(\sqrt{x}+2)}=\dfrac{1}{\sqrt{4}+2}=\dfrac{1}{4}$', 'professor'),
  ('limites', 'advanced', 8, 'Calcula $$\lim_{x\to\infty}\frac{5x^3-2x}{2x^3+x^2}$$',
   '["$0$", "$2$", "$\\frac{5}{2}$", "$\\infty$"]', '$\frac{5}{2}$',
   'Dividimos entre $x^3$: $\dfrac{5-\frac{2}{x^2}}{2+\frac{1}{x}}\to\dfrac{5}{2}$', 'professor'),
  ('limites', 'easy', 2, 'Calcula $$\lim_{x\to 3}\left(2x-1\right)$$',
   '["$4$", "$5$", "$6$", "$7$"]', '$5$',
   'Sustituimos $x=3$: $2(3)-1=5$', 'ai'),
  ('limites', 'easy', 2, 'Calcula $$\lim_{x\to -1}\left(x^3+2\right)$$',
   '["$-1$", "$0$", "$1$", "$3$"]', '$1$',
   'Sustituimos $x=-1$: $(-1)^3+2=-1+2=1$', 'ai'),
  ('limites', 'medium', 4, 'Calcula $$\lim_{x\to 3}\frac{x^2-9}{x-3}$$',
   '["$0$", "$3$", "$6$", "$9$"]', '$6$',
   'Factorizamos $x^2-9=(x-3)(x+3)$: $\lim_{x\to3}(x+3)=6$', 'ai'),
  ('limites', 'medium', 4, 'Calcula $$\lim_{x\to 2}\frac{x^3-8}{x-2}$$',
   '["$4$", "$8$", "$12$", "$16$"]', '$12$',
   'Diferencia de cubos: $x^3-8=(x-2)(x^2+2x+4)$. Entonces $\lim_{x\to2}(x^2+2x+4)=4+4+4=12$', 'ai'),
  ('limites', 'hard', 6, 'Calcula $$\lim_{x\to 0}\frac{\sqrt{x+9}-3}{x}$$',
   '["$\\frac{1}{3}$", "$\\frac{1}{6}$", "$\\frac{1}{9}$", "$0$"]', '$\frac{1}{6}$',
   'Multiplicamos por el conjugado: $\dfrac{x}{x(\sqrt{x+9}+3)}=\dfrac{1}{\sqrt{9}+3}=\dfrac{1}{6}$', 'ai'),
  ('limites', 'hard', 6, 'Calcula $$\lim_{x\to 0}\frac{\operatorname{sen}(3x)}{x}$$',
   '["$0$", "$1$", "$3$", "$\\frac{1}{3}$"]', '$3$',
   'Usamos $\lim_{u\to0}\frac{\operatorname{sen} u}{u}=1$: $\dfrac{\operatorname{sen}(3x)}{x}=3\cdot\dfrac{\operatorname{sen}(3x)}{3x}\to 3$', 'ai'),
  ('limites', 'advanced', 8, 'Calcula $$\lim_{x\to\infty}\frac{3x^2+1}{x^2-4}$$',
   '["$0$", "$1$", "$3$", "$\\infty$"]', '$3$',
   'Dividimos entre $x^2$: $\dfrac{3+\frac{1}{x^2}}{1-\frac{4}{x^2}}\to\dfrac{3}{1}=3$', 'ai'),
  ('limites', 'advanced', 8, 'Calcula $$\lim_{x\to\infty}\frac{2x+5}{x^2+1}$$',
   '["$0$", "$2$", "$5$", "$\\infty$"]', '$0$',
   'El grado del denominador ($2$) es mayor que el del numerador ($1$), así que el límite es $0$', 'ai')
on conflict (question) do nothing;

-- ── CONTINUIDAD ───────────────────────────────────────
insert into exercises (topic, difficulty, points, question, options, correct_answer, explanation, source) values
  ('continuidad', 'easy', 2, '¿Es continua $f(x)=x^2+1$ en $x=2$?',
   '["Sí", "No, $f(2)$ no existe", "No, el límite no existe", "No, $\\lim_{x\\to2}f(x)\\neq f(2)$"]', 'Sí',
   'Los polinomios son continuos en todo $\mathbb{R}$: $f(2)=5$ y $\lim_{x\to2}f(x)=5$', 'ai'),
  ('continuidad', 'easy', 2, '¿En qué punto es discontinua $$f(x)=\frac{1}{x-3}$$',
   '["$x=0$", "$x=1$", "$x=3$", "Es continua en todo $\\mathbb{R}$"]', '$x=3$',
   'En $x=3$ el denominador vale $0$, así que $f(3)$ no existe', 'ai'),
  ('continuidad', 'medium', 4, '¿Qué tipo de discontinuidad tiene en $x=2$ la función $$f(x)=\frac{x^2-4}{x-2}$$',
   '["Evitable", "De salto", "Infinita", "Es continua"]', 'Evitable',
   '$f(2)$ no existe, pero $\lim_{x\to2}\frac{(x-2)(x+2)}{x-2}=\lim_{x\to2}(x+2)=4$ sí existe $\Rightarrow$ evitable', 'ai'),
  ('continuidad', 'medium', 4, '¿Qué valor debe tener $f(1)$ para que sea continua en $x=1$? $$f(x)=\frac{x^2-1}{x-1}$$',
   '["$0$", "$1$", "$2$", "No es posible"]', '$2$',
   '$\lim_{x\to1}\frac{(x-1)(x+1)}{x-1}=2$. Definiendo $f(1)=2$ la función queda continua', 'ai'),
  ('continuidad', 'hard', 6, 'Halla $k$ para que $f$ sea continua en $x=2$: $$f(x)=\begin{cases}kx+1 & x<2\\ x^2-1 & x\ge 2\end{cases}$$',
   '["$0$", "$1$", "$\\frac{3}{2}$", "$2$"]', '$1$',
   'Límite izquierdo: $2k+1$. Límite derecho: $2^2-1=3$. Igualamos: $2k+1=3\Rightarrow k=1$', 'ai'),
  ('continuidad', 'hard', 6, '¿Qué pasa en $x=0$? $$f(x)=\begin{cases}x+1 & x<0\\ x^2+3 & x\ge 0\end{cases}$$',
   '["Evitable", "De salto", "Infinita", "Es continua"]', 'De salto',
   'Límite izquierdo: $0+1=1$. Límite derecho: $0+3=3$. Los laterales son distintos $\Rightarrow$ salto', 'ai'),
  ('continuidad', 'advanced', 8, 'Halla $a$ y $b$ para que $f$ sea continua en $\mathbb{R}$: $$f(x)=\begin{cases}x+a & x<1\\ bx^2 & 1\le x<2\\ 4 & x\ge 2\end{cases}$$',
   '["$a=0,\\ b=1$", "$a=1,\\ b=1$", "$a=0,\\ b=2$", "$a=1,\\ b=0$"]', '$a=0,\ b=1$',
   'En $x=2$: $b(2)^2=4\Rightarrow b=1$. En $x=1$: $1+a=b(1)^2=1\Rightarrow a=0$', 'ai'),
  ('continuidad', 'advanced', 8, '¿Qué discontinuidades tiene $$f(x)=\frac{x-1}{x^2-1}$$',
   '["Evitable en $x=1$ e infinita en $x=-1$", "Infinitas en $x=1$ y $x=-1$", "Solo infinita en $x=1$", "Ninguna"]', 'Evitable en $x=1$ e infinita en $x=-1$',
   '$x^2-1=(x-1)(x+1)$. En $x=1$ se cancela (límite $=\frac{1}{2}$) $\Rightarrow$ evitable. En $x=-1$ el denominador $\to0$ $\Rightarrow$ infinita', 'ai')
on conflict (question) do nothing;

-- ── DERIVADAS BÁSICAS (derivación directa) ────────────
insert into exercises (topic, difficulty, points, question, options, correct_answer, explanation, source) values
  ('derivadas_basicas', 'easy', 2, 'Deriva $$f(x)=5x^3$$',
   '["$15x^2$", "$5x^2$", "$15x^3$", "$3x^2$"]', '$15x^2$',
   'Regla de la potencia: $\frac{d}{dx}x^n=nx^{n-1}\Rightarrow 5\cdot3x^2=15x^2$', 'ai'),
  ('derivadas_basicas', 'easy', 2, 'Deriva $$f(x)=4x^2-7x+2$$',
   '["$8x-7$", "$4x-7$", "$8x+2$", "$8x^2-7$"]', '$8x-7$',
   'Término a término: $8x-7+0$ (la derivada de una constante es $0$)', 'ai'),
  ('derivadas_basicas', 'medium', 4, 'Deriva $$f(x)=x^2\operatorname{sen} x$$',
   '["$2x\\operatorname{sen} x+x^2\\cos x$", "$2x\\cos x$", "$x^2\\cos x$", "$2x\\operatorname{sen} x-x^2\\cos x$"]', '$2x\operatorname{sen} x+x^2\cos x$',
   'Regla del producto $(uv)''=u''v+uv''$: $2x\operatorname{sen} x+x^2\cos x$', 'ai'),
  ('derivadas_basicas', 'medium', 4, 'Deriva $$f(x)=\sqrt{x}+\frac{1}{x}$$',
   '["$\\frac{1}{2\\sqrt{x}}-\\frac{1}{x^2}$", "$\\frac{1}{2\\sqrt{x}}+\\frac{1}{x^2}$", "$2\\sqrt{x}-\\frac{1}{x^2}$", "$\\frac{1}{\\sqrt{x}}-\\frac{1}{x^2}$"]', '$\frac{1}{2\sqrt{x}}-\frac{1}{x^2}$',
   '$\sqrt{x}=x^{1/2}\Rightarrow\frac{1}{2}x^{-1/2}=\frac{1}{2\sqrt{x}}$. $\ \frac{1}{x}=x^{-1}\Rightarrow -x^{-2}=-\frac{1}{x^2}$', 'ai'),
  ('derivadas_basicas', 'hard', 6, 'Deriva $$f(x)=\frac{x+1}{x-1}$$',
   '["$-\\frac{2}{(x-1)^2}$", "$\\frac{2}{(x-1)^2}$", "$1$", "$\\frac{2x}{(x-1)^2}$"]', '$-\frac{2}{(x-1)^2}$',
   'Regla del cociente: $\dfrac{(1)(x-1)-(x+1)(1)}{(x-1)^2}=\dfrac{-2}{(x-1)^2}$', 'ai'),
  ('derivadas_basicas', 'hard', 6, 'Deriva $$f(x)=e^{x}\ln x$$',
   '["$e^{x}\\ln x+\\frac{e^{x}}{x}$", "$\\frac{e^{x}}{x}$", "$e^{x}\\ln x-\\frac{e^{x}}{x}$", "$e^{x}+\\frac{1}{x}$"]', '$e^{x}\ln x+\frac{e^{x}}{x}$',
   'Regla del producto: $(e^x)''\ln x+e^x(\ln x)''=e^x\ln x+\dfrac{e^x}{x}$', 'ai'),
  ('derivadas_basicas', 'advanced', 8, 'Deriva $$f(x)=\frac{\tan x}{x^2}$$',
   '["$\\frac{x\\sec^2 x-2\\tan x}{x^3}$", "$\\frac{\\sec^2 x}{2x}$", "$\\frac{x\\sec^2 x+2\\tan x}{x^3}$", "$\\frac{\\sec^2 x-2\\tan x}{x^3}$"]', '$\frac{x\sec^2 x-2\tan x}{x^3}$',
   'Cociente: $\dfrac{x^2\sec^2 x-2x\tan x}{x^4}$. Sacamos $x$ del numerador: $\dfrac{x\sec^2 x-2\tan x}{x^3}$', 'ai'),
  ('derivadas_basicas', 'advanced', 8, 'Calcula la segunda derivada $f''''(x)$ de $$f(x)=x^4-3x^2+5x$$',
   '["$12x^2-6$", "$4x^3-6x+5$", "$12x^2-6x$", "$12x-6$"]', '$12x^2-6$',
   '$f''(x)=4x^3-6x+5$. Derivamos otra vez: $f''''(x)=12x^2-6$', 'ai')
on conflict (question) do nothing;

-- ── REGLA DE LA CADENA ────────────────────────────────
insert into exercises (topic, difficulty, points, question, options, correct_answer, explanation, source) values
  ('regla_cadena', 'easy', 2, 'Deriva $$f(x)=(2x+1)^3$$',
   '["$6(2x+1)^2$", "$3(2x+1)^2$", "$(2x+1)^2$", "$6(2x+1)^3$"]', '$6(2x+1)^2$',
   'Cadena: $3(2x+1)^2\cdot(2x+1)''=3(2x+1)^2\cdot2=6(2x+1)^2$', 'ai'),
  ('regla_cadena', 'easy', 2, 'Deriva $$f(x)=\operatorname{sen}(3x)$$',
   '["$3\\cos(3x)$", "$\\cos(3x)$", "$-3\\cos(3x)$", "$3\\operatorname{sen}(3x)$"]', '$3\cos(3x)$',
   'Cadena: $\cos(3x)\cdot(3x)''=3\cos(3x)$', 'ai'),
  ('regla_cadena', 'medium', 4, 'Deriva $$f(x)=e^{x^2}$$',
   '["$2x\\,e^{x^2}$", "$e^{x^2}$", "$x^2e^{x^2-1}$", "$2e^{x^2}$"]', '$2x\,e^{x^2}$',
   'Cadena: $e^{x^2}\cdot(x^2)''=2x\,e^{x^2}$', 'ai'),
  ('regla_cadena', 'medium', 4, 'Deriva $$f(x)=\sqrt{x^2+1}$$',
   '["$\\frac{x}{\\sqrt{x^2+1}}$", "$\\frac{1}{2\\sqrt{x^2+1}}$", "$\\frac{2x}{\\sqrt{x^2+1}}$", "$x\\sqrt{x^2+1}$"]', '$\frac{x}{\sqrt{x^2+1}}$',
   'Cadena: $\dfrac{1}{2\sqrt{x^2+1}}\cdot 2x=\dfrac{x}{\sqrt{x^2+1}}$', 'ai'),
  ('regla_cadena', 'hard', 6, 'Deriva $$f(x)=\ln(\cos x)$$',
   '["$-\\tan x$", "$\\tan x$", "$\\frac{1}{\\cos x}$", "$-\\frac{1}{\\operatorname{sen} x}$"]', '$-\tan x$',
   'Cadena: $\dfrac{1}{\cos x}\cdot(-\operatorname{sen} x)=-\dfrac{\operatorname{sen} x}{\cos x}=-\tan x$', 'ai'),
  ('regla_cadena', 'hard', 6, 'Deriva $$f(x)=(x^2-3x)^5$$',
   '["$5(x^2-3x)^4(2x-3)$", "$5(x^2-3x)^4$", "$5(2x-3)^4$", "$(x^2-3x)^4(2x-3)$"]', '$5(x^2-3x)^4(2x-3)$',
   'Cadena: $5(x^2-3x)^4\cdot(x^2-3x)''=5(x^2-3x)^4(2x-3)$', 'ai'),
  ('regla_cadena', 'advanced', 8, 'Deriva $$f(x)=\operatorname{sen}^2(4x)$$',
   '["$8\\operatorname{sen}(4x)\\cos(4x)$", "$2\\operatorname{sen}(4x)\\cos(4x)$", "$8\\cos(4x)$", "$\\operatorname{sen}(8x)$"]', '$8\operatorname{sen}(4x)\cos(4x)$',
   'Cadena doble: $2\operatorname{sen}(4x)\cdot\cos(4x)\cdot4=8\operatorname{sen}(4x)\cos(4x)$ (equivale a $4\operatorname{sen}(8x)$)', 'ai'),
  ('regla_cadena', 'advanced', 8, 'Deriva $$f(x)=e^{\operatorname{sen}(x^2)}$$',
   '["$2x\\cos(x^2)\\,e^{\\operatorname{sen}(x^2)}$", "$\\cos(x^2)\\,e^{\\operatorname{sen}(x^2)}$", "$e^{\\operatorname{sen}(x^2)}$", "$2x\\,e^{\\cos(x^2)}$"]', '$2x\cos(x^2)\,e^{\operatorname{sen}(x^2)}$',
   'Cadena triple: $e^{\operatorname{sen}(x^2)}\cdot\cos(x^2)\cdot2x$', 'ai')
on conflict (question) do nothing;

-- ── DERIVADAS PARCIALES ───────────────────────────────
insert into exercises (topic, difficulty, points, question, options, correct_answer, explanation, source) values
  ('derivadas_parciales', 'easy', 2, 'Si $f(x,y)=3x^2+2y$, calcula $$\frac{\partial f}{\partial x}$$',
   '["$6x$", "$6x+2$", "$2$", "$3x^2$"]', '$6x$',
   'Derivamos respecto a $x$ tratando $y$ como constante: $6x+0=6x$', 'ai'),
  ('derivadas_parciales', 'easy', 2, 'Si $f(x,y)=x+5y^3$, calcula $$\frac{\partial f}{\partial y}$$',
   '["$15y^2$", "$1+15y^2$", "$5y^2$", "$15y$"]', '$15y^2$',
   'Derivamos respecto a $y$ tratando $x$ como constante: $0+15y^2=15y^2$', 'ai'),
  ('derivadas_parciales', 'medium', 4, 'Si $f(x,y)=x^2y^3$, calcula $$\frac{\partial f}{\partial x}$$',
   '["$2xy^3$", "$3x^2y^2$", "$2xy^3+3x^2y^2$", "$x^2y^3$"]', '$2xy^3$',
   '$y^3$ es constante respecto a $x$: $y^3\cdot2x=2xy^3$', 'ai'),
  ('derivadas_parciales', 'medium', 4, 'Si $f(x,y)=xy+y^2$, calcula $\dfrac{\partial f}{\partial y}$ en el punto $(1,2)$',
   '["$3$", "$4$", "$5$", "$6$"]', '$5$',
   '$\frac{\partial f}{\partial y}=x+2y$. En $(1,2)$: $1+2(2)=5$', 'ai'),
  ('derivadas_parciales', 'hard', 6, 'Si $f(x,y)=e^{xy}$, calcula $$\frac{\partial f}{\partial x}$$',
   '["$y\\,e^{xy}$", "$x\\,e^{xy}$", "$e^{xy}$", "$xy\\,e^{xy}$"]', '$y\,e^{xy}$',
   'Cadena con $y$ constante: $e^{xy}\cdot\frac{\partial}{\partial x}(xy)=y\,e^{xy}$', 'ai'),
  ('derivadas_parciales', 'hard', 6, 'Si $f(x,y)=\operatorname{sen} x\cos y$, calcula $$\frac{\partial f}{\partial y}$$',
   '["$-\\operatorname{sen} x\\operatorname{sen} y$", "$\\cos x\\cos y$", "$\\operatorname{sen} x\\operatorname{sen} y$", "$-\\cos x\\operatorname{sen} y$"]', '$-\operatorname{sen} x\operatorname{sen} y$',
   '$\operatorname{sen} x$ es constante respecto a $y$: $\operatorname{sen} x\cdot(-\operatorname{sen} y)=-\operatorname{sen} x\operatorname{sen} y$', 'ai'),
  ('derivadas_parciales', 'advanced', 8, 'Si $f(x,y)=x^3y^2-2xy$, calcula la derivada cruzada $$\frac{\partial^2 f}{\partial y\,\partial x}$$',
   '["$6x^2y-2$", "$6xy^2$", "$3x^2y^2-2y$", "$6x^2y$"]', '$6x^2y-2$',
   '$\frac{\partial f}{\partial x}=3x^2y^2-2y$. Ahora derivamos respecto a $y$: $6x^2y-2$', 'ai'),
  ('derivadas_parciales', 'advanced', 8, 'Si $f(x,y)=\ln(x^2+y^2)$, calcula $\dfrac{\partial f}{\partial x}$ en el punto $(1,1)$',
   '["$\\frac{1}{2}$", "$1$", "$2$", "$\\ln 2$"]', '$1$',
   '$\frac{\partial f}{\partial x}=\dfrac{2x}{x^2+y^2}$. En $(1,1)$: $\dfrac{2}{1+1}=1$', 'ai')
on conflict (question) do nothing;

-- ── APLICACIONES DE LA DERIVADA ───────────────────────
insert into exercises (topic, difficulty, points, question, options, correct_answer, explanation, source) values
  ('aplicaciones_derivada', 'easy', 2, '¿Cuál es la pendiente de la recta tangente a $f(x)=x^2$ en $x=3$?',
   '["$2$", "$3$", "$6$", "$9$"]', '$6$',
   'La pendiente es $f''(3)$. $f''(x)=2x\Rightarrow f''(3)=6$', 'ai'),
  ('aplicaciones_derivada', 'easy', 2, 'La posición de un objeto es $s(t)=4t^2$ metros. ¿Cuál es su velocidad en $t=2$ s?',
   '["$4\\ \\text{m/s}$", "$8\\ \\text{m/s}$", "$16\\ \\text{m/s}$", "$32\\ \\text{m/s}$"]', '$16\ \text{m/s}$',
   'La velocidad es la derivada de la posición: $v(t)=8t\Rightarrow v(2)=16$ m/s', 'ai'),
  ('aplicaciones_derivada', 'medium', 4, '¿Cuál es la ecuación de la recta tangente a $f(x)=x^2+1$ en $x=1$?',
   '["$y=2x$", "$y=2x+1$", "$y=x+1$", "$y=2x-1$"]', '$y=2x$',
   '$f(1)=2$ y $f''(1)=2$. Recta: $y-2=2(x-1)\Rightarrow y=2x$', 'ai'),
  ('aplicaciones_derivada', 'medium', 4, '¿Dónde está el punto crítico de $f(x)=x^2-6x+5$?',
   '["$x=3$", "$x=-3$", "$x=5$", "$x=6$"]', '$x=3$',
   '$f''(x)=2x-6=0\Rightarrow x=3$', 'ai'),
  ('aplicaciones_derivada', 'hard', 6, '¿En qué $x$ tiene un máximo relativo $f(x)=x^3-3x$?',
   '["$x=-1$", "$x=1$", "$x=0$", "$x=3$"]', '$x=-1$',
   '$f''(x)=3x^2-3=0\Rightarrow x=\pm1$. $f''''(x)=6x$: $f''''(-1)=-6<0\Rightarrow$ máximo en $x=-1$', 'ai'),
  ('aplicaciones_derivada', 'hard', 6, '¿En qué intervalo es creciente $f(x)=x^3-12x$?',
   '["$(-\\infty,-2)\\cup(2,\\infty)$", "$(-2,2)$", "$(0,\\infty)$", "$(-\\infty,2)$"]', '$(-\infty,-2)\cup(2,\infty)$',
   '$f''(x)=3x^2-12>0\Rightarrow x^2>4\Rightarrow x<-2$ o $x>2$', 'ai'),
  ('aplicaciones_derivada', 'advanced', 8, 'Con $40$ m de cerca se encierra un rectángulo. ¿Cuál es el área máxima posible?',
   '["$80\\ \\text{m}^2$", "$100\\ \\text{m}^2$", "$120\\ \\text{m}^2$", "$400\\ \\text{m}^2$"]', '$100\ \text{m}^2$',
   'Perímetro: $2x+2y=40\Rightarrow y=20-x$. $A(x)=x(20-x)$, $A''(x)=20-2x=0\Rightarrow x=10,\ y=10\Rightarrow A=100\ \text{m}^2$', 'ai'),
  ('aplicaciones_derivada', 'advanced', 8, 'El radio de un círculo crece a $2$ cm/s. ¿A qué ritmo crece el área cuando $r=5$ cm?',
   '["$4\\pi\\ \\text{cm}^2/\\text{s}$", "$10\\pi\\ \\text{cm}^2/\\text{s}$", "$20\\pi\\ \\text{cm}^2/\\text{s}$", "$25\\pi\\ \\text{cm}^2/\\text{s}$"]', '$20\pi\ \text{cm}^2/\text{s}$',
   '$A=\pi r^2\Rightarrow\dfrac{dA}{dt}=2\pi r\dfrac{dr}{dt}=2\pi(5)(2)=20\pi\ \text{cm}^2/\text{s}$', 'ai')
on conflict (question) do nothing;

commit;
