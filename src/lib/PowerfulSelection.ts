export interface PointXY {
  x: number
  y: number
}

export class PowerfulSelection {
  constructor(private selection: Selection) {}

  public hasSelectedContent(): boolean {
    const selection = this.selection
    if (selection.rangeCount === 0) {
      return false
    }

    return !(
      selection.anchorOffset === selection.focusOffset &&
      selection.anchorNode === selection.focusNode
    )
  }

  public firstRange(): Range {
    return this.selection.getRangeAt(0)
  }

  public getBoundingClientRect(): DOMRect {
    return this.firstRange().getBoundingClientRect()
  }

  public getBottomRightCorner(): PointXY {
    const r = this.firstRange()
    const end = new Range()
    end.setStart(r.endContainer, r.endOffset)
    const rect = end.getBoundingClientRect()

    return { x: rect.bottom, y: rect.right }
  }

  public getTopLeftCorner(): PointXY {
    const r = this.firstRange()
    const start = new Range()
    start.setStart(r.startContainer, r.startOffset)
    const rect = start.getBoundingClientRect()

    return { x: rect.top, y: rect.left }
  }

  public getFloatWindowReference(): [number, number, number, number] {
    const r = this.firstRange()
    const start = new Range()
    start.setStart(r.startContainer, r.startOffset)
    const rect1 = start.getBoundingClientRect()
    const end = new Range()
    end.setStart(r.endContainer, r.endOffset)
    const rect2 = end.getBoundingClientRect()

    return [rect1.bottom, rect1.right, rect2.top, rect2.left]
  }

  public toString(): string {
    return this.selection.toString()
  }

  public static fromUserSelection(): PowerfulSelection {
    return new PowerfulSelection(document.getSelection())
  }
}
