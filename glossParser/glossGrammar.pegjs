{{
import * as g from '../src/glossUtils'
}}

Expression =
  phrases:Phrase+ {
    return new g.GlossDocument(phrases);
  }

Phrase =
  pre:"\""? head:GlossElement tail:(___ el:GlossElement { return el })* post:EndPunctuation {
    return new g.Phrase(location(), [head, ...tail], pre, post)
  }

GlossElement =
  number:Number pre:(p:Padding ___ {return p})? term:GlossedTerm post:(___ p:Padding &(___/EndPunctuation) {return p})? {
    return new g.ReorderedGlossSegment(location(), +number, pre, term, post)
  }
  / GlossedTerm
  / Padding

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

InflectionSegment =
  "[" chars:IdentifierCharactersAllowingHyphens "]" {
    return new g.InflectionSegment(location(), chars)
  }

LemmaSegment =
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

EndPunctuation =
  $(s1:Space* p:NonSpaceEndPunctuation+ s2:Space*) / !. {
    return ''
  }


Space "space" = ' '
NonSpaceEndPunctuation "end punctuation" = ($(pre:[.!?,;\n\r] q:'"'?) / '--')

Number =
  [1-9]

___ "mandatorywhitespace" =
  x:$' '+