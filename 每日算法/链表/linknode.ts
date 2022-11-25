export class LinkedNode {
  constructor(public value?:any, public next?: LinkedNode | null) {
    this.value = value;
    this.next = next;
  }
}