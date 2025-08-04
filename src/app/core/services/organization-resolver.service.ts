import { Injectable } from '@angular/core';
import { Observable, forkJoin, of, map } from 'rxjs';
import { OrganizationService } from './organization.service';
import { organization, zones, street } from '../models/organization.model';

export interface OrganizationData {
     organizationId: string;
     organizationName: string;
}

export interface ZoneData {
     zoneId: string;
     zoneName: string;
     organizationId: string;
}

export interface StreetData {
     streetId: string;
     streetName: string;
     zoneId: string;
}

export interface ResolvedUserData {
     organizationName?: string;
     zoneName?: string;
     streetName?: string;
}

@Injectable({
     providedIn: 'root'
})
export class OrganizationResolverService {

     constructor(private organizationService: OrganizationService) { }

     /**
      * Obtener todas las organizaciones
      */
     getAllOrganizations(): Observable<OrganizationData[]> {
          return this.organizationService.getAllOrganization().pipe(
               map((organizations: organization[]) =>
                    organizations.map(org => ({
                         organizationId: org.organizationId,
                         organizationName: org.organizationName
                    }))
               )
          );
     }

     /**
      * Obtener todas las zonas
      */
     getAllZones(): Observable<ZoneData[]> {
          return this.organizationService.getAllZones().pipe(
               map((zones: zones[]) =>
                    zones.map(zone => ({
                         zoneId: zone.zoneId,
                         zoneName: zone.zoneName,
                         organizationId: zone.organizationId
                    }))
               )
          );
     }

     /**
      * Obtener todas las calles
      */
     getAllStreets(): Observable<StreetData[]> {
          return this.organizationService.getAllStreet().pipe(
               map((streets: street[]) =>
                    streets.map(street => ({
                         streetId: street.streetId,
                         streetName: street.streetName,
                         zoneId: street.zoneId
                    }))
               )
          );
     }

     /**
      * Obtener zonas filtradas por organización
      */
     getZonesByOrganization(organizationId: string): Observable<ZoneData[]> {
          return this.getAllZones().pipe(
               map(zones => zones.filter(zone => zone.organizationId === organizationId))
          );
     }

     /**
      * Obtener calles filtradas por zona
      */
     getStreetsByZone(zoneId: string): Observable<StreetData[]> {
          return this.getAllStreets().pipe(
               map(streets => streets.filter(street => street.zoneId === zoneId))
          );
     }

     /**
      * Resolver nombres de organización, zona y calle por sus IDs
      */
     resolveUserLocationData(organizationId?: string, zoneId?: string, streetId?: string): Observable<ResolvedUserData> {
          const observables: { [key: string]: Observable<any> } = {};

          if (organizationId) {
               observables['organization'] = this.organizationService.getOrganizationById(organizationId);
          }

          if (zoneId) {
               observables['zone'] = this.organizationService.getZoneById(zoneId);
          }

          if (streetId) {
               observables['street'] = this.organizationService.getStreetById(streetId);
          }

          if (Object.keys(observables).length === 0) {
               return of({});
          }

          return forkJoin(observables).pipe(
               map(results => ({
                    organizationName: results['organization']?.organizationName,
                    zoneName: results['zone']?.zoneName,
                    streetName: results['street']?.streetName
               }))
          );
     }

     /**
      * Obtener nombre de organización por ID
      */
     getOrganizationName(organizationId: string): Observable<string> {
          return this.organizationService.getOrganizationById(organizationId).pipe(
               map(org => org?.organizationName || 'No disponible')
          );
     }

     /**
      * Obtener nombre de zona por ID
      */
     getZoneName(zoneId: string): Observable<string> {
          return this.organizationService.getZoneById(zoneId).pipe(
               map(zone => zone?.zoneName || 'No disponible')
          );
     }

     /**
      * Obtener nombre de calle por ID
      */
     getStreetName(streetId: string): Observable<string> {
          return this.organizationService.getStreetById(streetId).pipe(
               map(street => street?.streetName || 'No disponible')
          );
     }
}
