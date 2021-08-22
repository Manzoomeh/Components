console.log("hi");

// enum ViewMode1{
//     grid,
//     tile
// }

// declare type ViewMode = "grid"|"tile";

// let mode:ViewMode=""

let obj1 = { id: 1, data: "hi" };
let obj2 = { ex: "33", ...obj1 };

interface IHierarchyNode {
  data: any;
  chields?: Array<IHierarchyNode>;
}

interface IFileHierarchyNode {
  data: any;
  parent: IFileHierarchyNode;
  chields?: Array<IFileHierarchyNode>;
}

class t {
  private static toFileHierarchyNode(
    nodes: IHierarchyNode
  ): IFileHierarchyNode {
    const fn: (
      parent: IFileHierarchyNode,
      node: IHierarchyNode
    ) => IFileHierarchyNode = function (parent, node) {
      const retVal: IFileHierarchyNode = {
        parent: parent,
        data: node.data,
        chields: null,
      };
      retVal.chields = node?.chields.map((x) => fn(retVal, x));
      return retVal;
    };

    return null;
  }
}
