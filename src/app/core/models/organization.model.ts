export interface organization{
      organizationId:string;
      organizationCode:string;
      organizationName:string;
      address:string;
      phone:string;
      legalRepresentative:string;
      status:Status;
}

export interface organizationCreate{
      organizationCode:string;
      organizationName:string;
      address:string;
      phone:string;
      legalRepresentative:string;
}

export interface organizationUpdate{
      organizationCode:string;
      organizationName:string;
      address:string;
      phone:string;
      legalRepresentative:string;
}

// Zones
export interface zones{
      zoneId: string,
      organizationId: string,
      zoneCode: string,
      zoneName: string,
      description:string,
      status: Status
}

export interface zonesCreate{
      organizationId: string,
      zoneName: string,
      description:string,
}

export interface zonesUpdate{
      organizationId: string,
      zoneCode: string,
      zoneName: string,
      description:string,
}

//streets 
export interface street{
      streetId: string,
        zoneId: string,
        streetCode: string,
        streetName: string,
        streetType: string,
        status: Status,
}

export interface streetCreate{
        zoneId: string,
        streetName: string,
        streetType: string,
}
export interface streetUpdate{
        zoneId: string,
        streetCode: string,
        streetName: string,
        streetType: string,
}

export enum Status{
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}