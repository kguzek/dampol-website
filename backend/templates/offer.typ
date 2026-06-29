#let data-path = sys.inputs.at("data", default: "offer.json")
#let offer = json(data-path)
#let labels = offer.labels

#let check-item(item) = [
  #grid(columns: (14pt, 1fr), gutter: 3pt)[#text(fill: rgb("15803d"), weight: "bold")[✓]][#item]
  #v(3pt)
]

#let arrow-item(item) = [
  #grid(columns: (14pt, 1fr), gutter: 3pt)[➢][#item]
  #v(3pt)
]

#let section(title, paragraphs) = [
  #v(11pt)
  #text(weight: "bold")[#title]
  #v(4pt)
  #for paragraph in paragraphs [
    #paragraph
    #v(5pt)
  ]
]

#set document(title: labels.title)
#set page(paper: "a4", margin: (x: 22mm, y: 18mm))
#set text(font: "Liberation Sans", size: 10.5pt, lang: offer.language)
#set par(justify: true, leading: 0.62em)

#grid(columns: (1fr, auto), align: (left, right))[
  #text(size: 11pt, weight: "bold")[Dampol Investment Sp. z o.o.]\
  Ul. Gliwicka 20A\
  42-677 Czekanów, PL\
  NIP 645 258 19 61\
  #v(5pt)
  #labels.contact: Karolina, Tel. +48 664457352\
  #labels.valid_for: #labels.valid_days
][
  Czekanów, PL\
  #offer.header_date
]

#v(18pt)
#align(center)[#text(size: 18pt, weight: "bold")[#upper(labels.title)]]
#v(14pt)

#text(weight: "bold")[#offer.intro]
#v(6pt)

#for feature in offer.features [
  #check-item(feature)
]

#v(14pt)
#align(center)[
  #text(size: 15pt, weight: "bold", style: "italic")[#labels.price: #offer.price #offer.price_suffix]
]

#v(9pt)
#for notice in offer.tax_notice [
  #text(size: 9.5pt)[#notice]
  #v(4pt)
]

#if offer.extras.len() > 0 [
  #v(10pt)
  #text(weight: "bold")[#offer.extras_title]
  #v(5pt)
  #for extra in offer.extras [
    #arrow-item(extra)
  ]
]

#for item in offer.sections [
  #section(item.title, item.paragraphs)
]

#v(12pt)
#if offer.language == "pl" [
  #text(size: 8.5pt, fill: rgb("777777"))[Jesteśmy uczestnikiem Programu]\
  #text(fill: red, weight: "bold")[RZETELNA] #text(weight: "bold")[Firma]\
  #text(size: 8.5pt, fill: rgb("777777"))[Sprawdź naszą rzetelność na]\
  https://wizytowka.rzetelnafirma.pl/8P8S45HO
] else [
  #text(size: 8.5pt, fill: rgb("777777"))[We are a member of Reliable Company Programme]\
  #text(fill: red, weight: "bold")[RZETELNA] #text(weight: "bold")[Firma]\
  #text(size: 8.5pt, fill: rgb("777777"))[Verify our company here:]\
  https://wizytowka.rzetelnafirma.pl/8P8S45HO
]
