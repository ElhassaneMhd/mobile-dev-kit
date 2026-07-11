// Document Service
// Handles document downloads from /api/v1/documents/* endpoints

import { BaseApiService, defaultApiConfig } from './BaseApiService';
import { sharedTokenStorage } from './tokenStorage';
import { downloadAsync } from 'expo-file-system/legacy';
import { cacheDirectory } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

/**
 * Document download service for PDFs and other files
 * Used across student, professor, and coordinator portals
 */
class DocumentService extends BaseApiService {
  constructor() {
    super(defaultApiConfig, sharedTokenStorage);
    console.log('✅ [DOCUMENT SERVICE] Initialized with base URL:', this.baseUrl);
  }

  /**
   * Download transcript PDF - Complete workflow
   * Downloads PDF directly from /students/me/grades/transcript/pdf endpoint
   * 
   * Backend returns PDF directly with Content-Disposition header
   * 
   * @param academicYear - Optional academic year filter
   * @returns Promise<boolean> - true if successful, false otherwise
   * 
   * @example
   * await documentService.downloadAndShareTranscript();
   */
  async downloadAndShareTranscript(academicYear?: string): Promise<boolean> {
    try {
      console.log('📥 [documentService] Downloading transcript:', academicYear || 'all years');
      
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        Alert.alert('Erreur', 'Authentification requise');
        return false;
      }

      // Download directly - endpoint returns PDF with Content-Disposition header
      const endpoint = academicYear 
        ? `/students/me/grades/transcript/pdf?academicYear=${academicYear}`
        : '/students/me/grades/transcript/pdf';
      
      const url = `${this.baseUrl}${endpoint}`;
      const filename = `transcript_${Date.now()}.pdf`;
      const fileUri = cacheDirectory + filename;

      const downloadResult = await downloadAsync(
        url,
        fileUri,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      console.log('✅ [documentService] Download complete:', {
        uri: downloadResult.uri,
        status: downloadResult.status,
      });

      if (downloadResult.status === 200) {
        // Open PDF preview/share dialog
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Relevé de Notes',
            UTI: 'com.adobe.pdf',
          });
        } else {
          Alert.alert(
            'Document prêt',
            'Le fichier PDF a été téléchargé',
            [{ text: 'OK' }]
          );
        }
        return true;
      } else {
        Alert.alert('Erreur', 'Échec du téléchargement');
        return false;
      }
    } catch (error) {
      console.error('❌ [documentService] Transcript download failed:', error);
      Alert.alert('Erreur', 'Impossible de télécharger le relevé');
      return false;
    }
  }

  /**
   * Download and share a document (PDF) - Complete workflow
   * Downloads file using FileSystem.downloadAsync and opens share dialog
   * 
   * @param documentId - The ID of the document to download
   * @param documentName - Optional custom filename
   * @returns Promise<boolean> - true if successful, false otherwise
   * 
   * @example
   * await documentService.downloadAndShareDocument('11', 'justification.pdf');
   */
  async downloadAndShareDocument(
    documentId: string,
    documentName?: string
  ): Promise<boolean> {
    try {
      console.log('📥 [documentService] Downloading and sharing document:', documentId);
      
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        Alert.alert('Erreur', 'Authentification requise');
        return false;
      }

      // Download directly with FileSystem.downloadAsync
      const url = `${this.baseUrl}/documents/${documentId}`;
      const filename = documentName || `document_${documentId}.pdf`;
      const fileUri = cacheDirectory + filename;

      const downloadResult = await downloadAsync(
        url,
        fileUri,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      console.log('✅ [documentService] Download complete:', {
        uri: downloadResult.uri,
        status: downloadResult.status,
      });

      if (downloadResult.status === 200) {
        // Open PDF preview/share dialog
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Aperçu du document',
            UTI: 'com.adobe.pdf',
          });
        } else {
          Alert.alert(
            'Document prêt',
            'Le fichier PDF a été téléchargé',
            [{ text: 'OK' }]
          );
        }
        return true;
      } else {
        Alert.alert('Erreur', 'Échec du téléchargement');
        return false;
      }
    } catch (error) {
      console.error('❌ [documentService] Download failed:', error);
      Alert.alert('Erreur', 'Impossible de télécharger le document');
      return false;
    }
  }

  /**
   * Download and share a recommendation letter (PDF) - Complete workflow
   * Downloads file using FileSystem.downloadAsync and opens share dialog
   * 
   * @param recommendationId - The ID of the recommendation
   * @returns Promise<boolean> - true if successful, false otherwise
   * 
   * @example
   * await documentService.downloadAndShareRecommendation('15');
   */
  async downloadAndShareRecommendation(
    recommendationId: string
  ): Promise<boolean> {
    try {
      console.log('📄 [documentService] Downloading and sharing recommendation:', recommendationId);
      
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        Alert.alert('Erreur', 'Authentification requise');
        return false;
      }

      // Download directly with FileSystem.downloadAsync
      const url = `${this.baseUrl}/documents/${recommendationId}`;
      const filename = `recommendation_${recommendationId}_${Date.now()}.pdf`;
      const fileUri = cacheDirectory + filename;

      const downloadResult = await downloadAsync(
        url,
        fileUri,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      console.log('✅ [documentService] Download complete:', {
        uri: downloadResult.uri,
        status: downloadResult.status,
      });

      if (downloadResult.status === 200) {
        // Open PDF preview/share dialog
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Aperçu de la lettre de recommandation',
            UTI: 'com.adobe.pdf',
          });
        } else {
          Alert.alert(
            'Lettre prête',
            'Le fichier PDF a été téléchargé',
            [{ text: 'OK' }]
          );
        }
        return true;
      } else {
        Alert.alert('Erreur', 'Échec du téléchargement');
        return false;
      }
    } catch (error) {
      console.error('❌ [documentService] Download failed:', error);
      Alert.alert('Erreur', 'Impossible de télécharger la lettre');
      return false;
    }
  }
}

// Export singleton instance
export const documentService = new DocumentService();
export default documentService;
