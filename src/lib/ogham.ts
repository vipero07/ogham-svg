type OghamBGroup = 'b' | 'l' | 'v' | 'f' | 's' | 'n';
type OghamHGroup = 'h' | 'd' | 't' | 'c' | 'k' | 'q' | 'qu' | 'qw';
type OghamMGroup = 'm' | 'g' | 'ng' | 'z' | 'r';
type OghamAGroup = 'a' | 'o' | 'u' | 'e' | 'i';
type OghamMissingLetters = 'j' | 'w' | 'y' | 'p' | 'x';
type OghamDecorators = ' ' | 'begin' | 'end';

type OghamLetters = OghamBGroup | OghamHGroup | OghamMGroup | OghamAGroup | OghamDecorators;

type StrokeCount = 1 | 2 | 3 | 4 | 5;

const enum Stroke {
    right = 0,
    left = 1,
    notch = 2,
    across = 3,
    space = 4,
}

const Strokes = ['h2h-2', 'h-2h2', 'h-1h2h-1', 'l-2 -.5 4 1 -2 -.5', 'v-1'];

const Ogham = new Map<OghamLetters, [stroke: Stroke, count: StrokeCount, height?: number]>(
    [
        [' ', [Stroke.space, 1, 2]],

        ['b', [Stroke.right, 1]],
        ['l', [Stroke.right, 2]],
        ['v', [Stroke.right, 3]],
        ['f', [Stroke.right, 3]],
        ['s', [Stroke.right, 4]],
        ['n', [Stroke.right, 5]],

        ['h', [Stroke.left, 1]],
        ['d', [Stroke.left, 2]],
        ['t', [Stroke.left, 3]],
        ['c', [Stroke.left, 4]],
        ['k', [Stroke.left, 4]],
        ['q', [Stroke.left, 5]],
        ['qu', [Stroke.left, 5]],
        ['qw', [Stroke.left, 5]],

        ['m', [Stroke.across, 1, .5]],
        ['g', [Stroke.across, 2, .75]],
        ['ng', [Stroke.across, 3, 1]],
        ['z', [Stroke.across, 4, 1.25]],
        ['r', [Stroke.across, 5, 1.5]],

        ['a', [Stroke.notch, 1]],
        ['o', [Stroke.notch, 2]],
        ['u', [Stroke.notch, 3]],
        ['e', [Stroke.notch, 4]],
        ['i', [Stroke.notch, 5]],
    ]
)

const RightStrokes = new Map<OghamLetters, StrokeCount>(
    [
        ['b', 1],
        ['l', 2],
        ['v', 3],
        ['f', 3],
        ['s', 4],
        ['n', 5],
    ]
)

const LeftStrokes = new Map<OghamLetters, StrokeCount>(
    [
        ['h', 1],
        ['d', 2],
        ['t', 3],
        ['c', 4],
        ['k', 4],
        ['q', 5],
        ['qu', 5],
        ['qw', 5],
    ]
)

const AcrossStrokes = new Map<OghamLetters, StrokeCount>(
    [
        ['m', 1],
        ['g', 2],
        ['ng', 3],
        ['z', 4],
        ['r', 5],
    ]
)

const Notches = new Map<OghamLetters, StrokeCount>(
    [
        ['a', 1],
        ['o', 2],
        ['u', 3],
        ['e', 4],
        ['i', 5]
    ]
)

// https://en.wikipedia.org/wiki/Irish_orthography
// for p, x, ch, we can add the forfeda https://en.wikipedia.org/wiki/Forfeda
const LetterSubstitutions = new Map<OghamMissingLetters, OghamLetters | OghamLetters[]>(
    [
        ['j', ['i', 'o']],
        ['w', 'v'],
        ['y', 'i'],
        ['p', 'b'], // not happy with this, there is no plosive
        ['x', ['k', 's']],
    ]
)

function getLetterStrokes(letter: OghamLetters) {
    return Notches.get(letter) ?? RightStrokes.get(letter) ?? LeftStrokes.get(letter) ?? AcrossStrokes.get(letter) ?? (letter === ' ' ? 2 : undefined);
}

function drawMultiPath(letter: OghamLetters): [string, number, number] {
    if (letter === ' ') {
        return ['v-2', 2, 2];
    }
    const totalStrokes = getLetterStrokes(letter);
    if (!totalStrokes) {
        return ['', 0, 0];
    }
    const startX = RightStrokes.has(letter) ? 0 : Notches.has(letter) ? -1 : -2;
    const isAcross = AcrossStrokes.has(letter);
    const initialStroke = isAcross ? `${totalStrokes - 1} 4 2` : `${totalStrokes}h2`;
    const nextStrokes = isAcross ? `m-4-3 4 2` : `m-2-1h2`;
    const additionalStokes = Array.from({ length: totalStrokes - 1 }).map(() => nextStrokes).join('');
    const finalPosition = isAcross ? `m-2-2` : `m${(startX + 2) * -1}-1`;
    const verticalStrokes = totalStrokes + 1;

    return [`v-${verticalStrokes}m${startX} ${initialStroke}${additionalStokes}${finalPosition}`, verticalStrokes + (totalStrokes * (isAcross ? 4 : 2)), verticalStrokes];
}

function drawSinglePath({ letterStemFirst = true }: { letterStemFirst?: boolean }) {
    return function drawSinglePath(letter: OghamLetters): [string, number, number] {
        const stroke = Ogham.get(letter);
        if (!stroke) {
            return ['', 0, 0];
        }
        const height = stroke[2] ?? stroke[1];
        const isAccross = stroke[0] === Stroke.across;
        const startStroke = letterStemFirst ? `v-${height}v${height}` : isAccross? 'v-.5': 'v-1';
        const strokes = Array.from({ length: stroke[1] }).map(() => Strokes[stroke[0]]).join(isAccross? 'v-.5' :'v-1');
        return [`${startStroke}${strokes}${isAccross? 'v-.5': 'v-1'}`, stroke[1], height+1];
    }
}

// https://en.wikipedia.org/wiki/Irish_orthography
// for p, x, ch, we can add the forfeda https://en.wikipedia.org/wiki/Forfeda
function SubstituteMissingLetters(letter: OghamLetters | OghamMissingLetters): OghamLetters[] | OghamLetters {
    return LetterSubstitutions.get(letter as OghamMissingLetters) ?? (letter as OghamLetters);
}

export function splitLetters(word: string, phoneticSubstitute: boolean) {
    if (!word) {
        return [];
    }
    const oghamRegex = phoneticSubstitute ? /ng|q(?:u|w)|./gi : new RegExp(`ng|q(?:u|w)|[^${Array.from(LetterSubstitutions.keys()).join('')}]`, 'gi');
    const letters = word.toLocaleLowerCase('en-us').match(oghamRegex) as OghamLetters[];
    return phoneticSubstitute ? letters.flatMap(SubstituteMissingLetters) : letters;
}

export function WordToOghamSVG(word: string, { startingX = 2, phoneticSubstitute = true, singlePath = true, letterStemFirst = true, wordStemFirst = false }: { startingX?: number, phoneticSubstitute?: boolean, singlePath?: boolean, letterStemFirst?: boolean, wordStemFirst?: boolean }): [path: string, length: number, height: number] {
    const letters = splitLetters(word, phoneticSubstitute);
    const pathFunction = singlePath ? drawSinglePath({ letterStemFirst }) : drawMultiPath;
    const [path, length, height] = letters.map(pathFunction).reduce(([path, length, height], [p, l, h]) => {
        return [`${path}${p}`, length + l, height + h] as [string, number, number];
    }, ['', 0, 0] as [string, number, number]);

    return [`${wordStemFirst && singlePath ? `M${startingX} ${height}v-${height}` : `M${startingX}`} ${height}${path}`, length, height] as const;
}