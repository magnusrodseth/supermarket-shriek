export type TransformData = {
  x: number;
  y: number;
  degrees: number;
};

export type CustomAttributes = { name: string; value: any };

export type CustomElement = {
  nodeName: string;
  attributes: CustomAttributes[];
};

export type RecieveDataPayload =
  | {
      type: "walls";
      payload: CustomElement[];
    }
  | {
      type: "goal";
      payload: CustomElement[];
    }
  | {
      type: "winner";
      payload: string;
    }
  | {
      type: "update-opponents";
      payload: CustomElement[];
    }
  | {
      type: "remove-opponents";
      payload: string;
    };

export type SendDataPayload =
  | {
      type: "nick";
      payload: string;
    }
  | {
      type: "transform";
      payload: TransformData;
    };
