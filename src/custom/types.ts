import { BigNumber } from '@ethersproject/bignumber'

export interface WithClassName {
  className?: string
}

export type Split<S extends string, D extends string> =
    string extends S ? string[] :
    S extends '' ? [] :
    S extends `${infer T}${D}${infer U}` ? [T, ...Split<U, D>] :
    [S];


export type SimpleSolidityTypes = 'address' | 'string' | 'byte' | `bytes${number}` | `uint${number}` | 'uint' | 'bool'

export type SolidityTypeToJS<T extends SimpleSolidityTypes> =
    T extends 'address' | 'string' | 'byte' | `bytes${number}` ? string :
    T extends `uint${number}` | 'uint' ? BigNumber :
    T extends 'bool' ? boolean : never

export type PossibleAbiTypeSignatures = `${SimpleSolidityTypes} indexed ${string}` | `${SimpleSolidityTypes} ${string}`

type NoLessThan2Words = `${string} ${string}`

export type ParamsSignature2Obj<T extends string> =
    T extends `${infer Type} indexed ${infer Name}` ?
    Name extends NoLessThan2Words ? never :
    Type extends SimpleSolidityTypes ? {type: SolidityTypeToJS<Type>; indexed: true; name: Name} : never :
    T extends `${infer Type} ${infer Name}` ?
    Name extends NoLessThan2Words ? never :
    Type extends SimpleSolidityTypes ? {type: SolidityTypeToJS<Type>; name: Name} : never
    : never

export type EventSignature2Objects<T extends string> = ParamsSignature2Obj<Split<T, ', '>[number]>


export type EventParameters<T extends string> = {
    [
        K in EventSignature2Objects<T>
        as K['name']
    ]: K['type']
}

export type EventObject<T extends `event ${string}(${PossibleAbiTypeSignatures})`> = T extends `event ${infer Name}(${infer K})` ? {event: Name, params: EventParameters<K>} : never
