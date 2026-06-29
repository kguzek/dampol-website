#let data-path = sys.inputs.at("data", default: "offer.json")
#let offer = json(data-path)
#let labels = offer.labels

#let field(label, value) = if value != none and value != "" [
  #grid(columns: (38%, 62%), gutter: 8pt)[
    #strong(label)
  ][
    #value
  ]
]

#let section(title, body) = [
  #v(12pt)
  #text(size: 13pt, weight: "bold")[#title]
  #line(length: 100%, stroke: rgb("d8d8d8"))
  #v(5pt)
  #body
]

#set document(title: labels.title)
#set page(
  paper: "a4",
  margin: (x: 22mm, y: 20mm),
  footer: align(center)[#text(size: 8pt, fill: rgb("666666"))[#labels.footer]],
)
#set text(font: "Liberation Sans", size: 10.5pt, lang: offer.language)
#set par(justify: true, leading: 0.62em)

#grid(columns: (1fr, auto), align: (left, right))[
  #text(size: 11pt, weight: "bold")[Dampol Investment Sp. z o.o.]\
  Ul. Gliwicka 20A\
  42-677 Czekanów\
  NIP 645 258 19 61
][
  #labels.date: #offer.generated_at\
  #if offer.offer_id != "" [#labels.offer_no: #offer.offer_id]
]

#v(18pt)
#align(center)[#text(size: 20pt, weight: "bold")[#upper(labels.title)]]
#v(16pt)

#section(labels.configuration)[
  #field(labels.doors, offer.doors.join(", "))
  #field(labels.delivery_date, offer.delivery_date)
]

#if offer.windows.len() > 0 [
  #section(labels.windows)[
    #table(
      columns: (1fr, 1fr),
      inset: 6pt,
      stroke: rgb("dddddd"),
      table.header(
        [#strong(labels.material)],
        [#strong(labels.size)],
      ),
      ..offer.windows.map(window => (
        [#window.material],
        [#window.size],
      )).flatten(),
    )
  ]
]

#if offer.options.len() > 0 [
  #section(labels.options)[
    #table(
      columns: (1fr, 1fr),
      inset: 6pt,
      stroke: rgb("dddddd"),
      ..offer.options.map(option => (
        [#option.label],
        [#option.value],
      )).flatten(),
    )
  ]
]

#if offer.notes.len() > 0 [
  #section(labels.notes)[
    #for note in offer.notes [
      #strong(note.label): #note.text
      #v(5pt)
    ]
  ]
]

#v(18pt)
#align(center)[
  #block(inset: 12pt, fill: rgb("f4f4f4"), radius: 4pt)[
    #text(size: 15pt, weight: "bold")[#labels.price: #offer.price]
  ]
]

#v(24pt)
#text(size: 9pt, fill: rgb("666666"))[
  Przedstawiciel: Karolina\
  Tel. +48 66 44 57 352
]
