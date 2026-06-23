import {
  clientRepository,
  websiteRepository,
} from "@/lib/repositories";

export async function getClientForUser(clientId: string) {
  return clientRepository.getById(clientId);
}

export async function getWebsiteForUser(websiteId: string) {
  return websiteRepository.getById(websiteId);
}

export async function listClientsForUser() {
  return clientRepository.list();
}

export async function listWebsitesForUser() {
  return websiteRepository.list();
}
