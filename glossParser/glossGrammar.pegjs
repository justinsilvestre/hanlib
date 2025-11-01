{{
import * as g from '../src/glossUtils'
}}

Expression =
  sequences:GlossElementSequence* {
    return new g.GlossDocument(sequences);
  }


GlossElementSequenceDelimiter =
  ___? '/' ___? { return '' }
  / ___? t1:'~'? p:EndPunctuation+ t2:'~'? ___? { return (t1||'') + p.join('') + (t2||'') }
  / ___? !. { return '' }


GlossElement =
   pre:(p:Padding ___ {return p})? original:OriginalTerm ___ term:GlossedTerm post:(___ p:Padding {return p})? {
    return new g.GlossElement(location(), original, pre, term, post);
  }

GlossElementSequence =
  '>' head:GlossElement tail:( ___ '-' ___  g:GlossElement { return g })*  delimiter:GlossElementSequenceDelimiter {
    return new g.GlossElementSequence(location(), [head, ...tail], delimiter, '>');
  }
  / order:OrderNumberAnnotation? head:GlossElement tail:( ___ '-' ___  g:GlossElement { return g })*  delimiter:GlossElementSequenceDelimiter {
    return new g.GlossElementSequence(location(), [head, ...tail], delimiter, order ? +order : undefined);
  }

OriginalTerm =
  chars:$[^ \t\n\r]+ {
    return chars;
  }


GlossedTerm =
  lemma:LemmaSegment "[:" inflected:IdentifierCharactersAllowingHyphens "]" {
    return new g.GlossedTerm(location(), [new g.GlossedTermComponent(location(), [lemma])], undefined, inflected)
  }
  / head:GlossedTermComponent tail:("-" tailElement:GlossedTermComponent { return tailElement })+ idiomatic:IdiomaticGlossedTerm {
    return new g.GlossedTerm(location(), [head, ...tail], idiomatic)
  }
  / head:GlossedTermComponent idiomatic:IdiomaticGlossedTerm? {
    return new g.GlossedTerm(location(), [head], idiomatic)
  }

GlossedTermComponent =
  preI:InflectionSegment? segments:(lemma:LemmaSegment postI:InflectionSegment? { return postI ? [lemma, postI] : [lemma]})+ {
    return new g.GlossedTermComponent(location(), preI ? [preI, ...segments.flat()] : segments.flat())
  }

IdiomaticGlossedTerm =
  ___ "(" lemma:LemmaSegment "[:" inflected:IdentifierCharactersAllowingHyphens "]" ")" {
    return new g.IdiomaticGlossedTerm(location(), [lemma], inflected)
  }
  / ___ "(" segments:(InflectionSegment / LemmaSegment)+ ")" {
    return new g.IdiomaticGlossedTerm(location(), segments)
  }

InflectionSegment "inflection segment" =
  "[" chars:IdentifierCharactersAllowingHyphens "]" {
    return new g.InflectionSegment(location(), chars)
  }

LemmaSegment "lemma segment" =
  chars:IdentifierCharacters {
    return new g.LemmaSegment(location(), chars)
  }

Padding =
  "[" chars:IdentifierCharactersAllowingSpaces "]" {
    return new g.Padding(location(), chars)
  }


IdentifierCharacters "identifier characters"
  = $("\\" . / $[a-zA-Z'*_\^~])+

IdentifierCharactersAllowingHyphens
  = $("\\" . / $[a-zA-Z'*_\^~\-])+

IdentifierCharactersAllowingSpaces
  = $("\\" . / $[a-zA-Z'*_\^~\- ])+



Space "space" = ' '
EndPunctuation "end punctuation" = ([.!?,;"] 
  / $("\\n") { return `\n`; }
  / '_'
  / '--')

OrderNumberAnnotation =
  [1-9]

___ "mandatorywhitespace" =
  $([ \n\r]+)

