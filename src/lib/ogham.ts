type OghamBGroup = 'b' | 'l' | 'v' | 'f' | 's' | 'n';
type OghamHGroup = 'h' | 'd' | 't' | 'c' | 'k' | 'q' | 'qu' | 'qw';
type OghamMGroup = 'm' | 'g' | 'ng' | 'z' | 'r';
type OghamAGroup = 'a' | 'o' | 'u' | 'e' | 'i';
type OghamMissingLetters = 'j' | 'w' | 'y' | 'p' | 'x';
type OghamDecorators = ' ' | 'begin' | 'end';

type OghamLetters = OghamBGroup | OghamHGroup | OghamMGroup | OghamAGroup | OghamDecorators;

type StrokeCount = 1 | 2 | 3 | 4 | 5;

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
        ['w', 'u'],
        ['y', 'i'],
        ['p', 'b'], // not happy with this, there is no plosive
        ['x', ['k', 's']],
    ]
)

function getLetterStrokes(letter: OghamLetters) {
    return Notches.get(letter) ?? RightStrokes.get(letter) ?? LeftStrokes.get(letter) ?? AcrossStrokes.get(letter) ?? (letter === ' ' ? 2 : 0);
}

function LetterToOgham(letter: OghamLetters): [string, number, number] {
    if (letter === ' ') {
        return ['v-2', 2, 2];
    }
    const totalStrokes = getLetterStrokes(letter);
    const startX = RightStrokes.has(letter) ? 0 : Notches.has(letter) ? -1 : -2;
    if (!totalStrokes) {
        return ['', 0, 0];
    }
    const isAcross = AcrossStrokes.has(letter);
    const initialStroke = isAcross ? `${totalStrokes-1} 4 2` : `${totalStrokes}h2`;
    const nextStrokes = isAcross ? `m-4-3 4 2` : `m-2-1h2`;
    const additionalStokes = Array.from({ length: totalStrokes - 1 }).map(() => nextStrokes).join('');
    const finalPosition = isAcross ? ` -2-2` : `m${(startX + 2) * -1}-1`;
    const verticalStrokes = totalStrokes + 1;

    return [`v-${verticalStrokes}m${startX} ${initialStroke}${additionalStokes}${finalPosition}`, verticalStrokes + (totalStrokes * (isAcross ? 4 : 2)), verticalStrokes];
}

// https://en.wikipedia.org/wiki/Irish_orthography
// for p, x, ch, we can add the forfeda https://en.wikipedia.org/wiki/Forfeda
function SubstituteMissingLetters(letter: OghamLetters | OghamMissingLetters): OghamLetters[] | OghamLetters {
    return LetterSubstitutions.get(letter as OghamMissingLetters) ?? (letter as OghamLetters);
}

export function splitLetters(word:string, phoneticSubstitute: boolean){
    if(!word){
        return [];
    }
    const oghamRegex = phoneticSubstitute ? /ng|q(?:u|w)|./gi : new RegExp(`ng|q(?:u|w)|[^${Array.from(LetterSubstitutions.keys()).join('')}]`, 'gi');
    const letters = word.match(oghamRegex) as OghamLetters[];
    return phoneticSubstitute ? letters.flatMap(SubstituteMissingLetters) : letters;
}

export function WordToOghamSVG(word: string, { startingX, phoneticSubstitute }: { startingX: number, phoneticSubstitute: boolean } = {startingX: 2, phoneticSubstitute: true}): [path: string, length: number, height: number] {
    const letters = splitLetters(word, phoneticSubstitute);
    const [path, length, height] = letters.map(LetterToOgham).reduce(([path, length, height], [p, l, h]) => {
        return [`${path}${p}`, length + l, height + h] as [string, number, number];
    }, ['', 0, 0] as [string, number, number]);

    return [`m${startingX} ${height}${path}`, length, height] as const;
}