import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    PermissionsAndroid,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import TextRecognition, { Frame, TextRecognitionScript } from '@react-native-ml-kit/text-recognition';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types/navigation';
import { WordLanguage } from '../apis/words';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { colors, radius, shadow, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<MainStackParamList, 'Scan'>;

type Candidate = { text: string; frame?: Frame };
type Rect = { left: number; top: number; width: number; height: number };
type ManualRegion = { id: string; text: string; rect: Rect };

const WORD_PATTERN = /^[A-Za-z]{2,}$/;
// 히라가나(3040-309F) + 가타카나(30A0-30FF) + 한자(4E00-9FFF)
const JAPANESE_PATTERN = /^[぀-ゟ゠-ヿ一-鿿]+$/;
const JAPANESE_STRIP_PATTERN = /[^぀-ゟ゠-ヿ一-鿿]/g;
const PREVIEW_WIDTH = Dimensions.get('window').width - spacing.lg * 2;

export default function ScanScreen({ route, navigation }: Props) {
    const { bookId, language } = route.params;
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [photoSize, setPhotoSize] = useState<{ width: number; height: number } | null>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [recognizing, setRecognizing] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [mode, setMode] = useState<'auto' | 'manual'>('auto');
    const [allElements, setAllElements] = useState<Candidate[]>([]);
    const [manualRegions, setManualRegions] = useState<ManualRegion[]>([]);
    const [drawingRect, setDrawingRect] = useState<Rect | null>(null);
    const startPointRef = useRef({ x: 0, y: 0 });

    const handlePickPhoto = async (source: 'camera' | 'library') => {
        if (source === 'camera' && !(await requestCameraPermission())) {
            Alert.alert('카메라 권한 필요', '사진 촬영을 위해 카메라 권한을 허용해주세요.');
            return;
        }

        const result =
            source === 'camera'
                ? await launchCamera({ mediaType: 'photo', quality: 0.8, saveToPhotos: false })
                : await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });

        if (result.errorCode) {
            Alert.alert('오류', result.errorMessage ?? '사진을 가져오지 못했어요.');
            return;
        }
        const asset = result.assets?.[0];
        if (!asset?.uri) return;

        setPhotoUri(asset.uri);
        setPhotoSize(asset.width && asset.height ? { width: asset.width, height: asset.height } : null);
        setRecognizing(true);
        setCandidates([]);
        setSelected(new Set());
        setAllElements([]);
        setManualRegions([]);
        setDrawingRect(null);
        try {
            const script = language === 'JA' ? TextRecognitionScript.JAPANESE : TextRecognitionScript.LATIN;
            const recognized = await TextRecognition.recognize(asset.uri, script);
            const words = extractCandidateWords(recognized.blocks, language);
            setCandidates(words);
            setAllElements(flattenElements(recognized.blocks));
            if (words.length === 0) {
                Alert.alert('인식된 단어 없음', '사진에서 단어를 찾지 못했어요. 다른 사진으로 시도해보세요.');
            }
        } catch {
            Alert.alert('인식 실패', '텍스트 인식 중 오류가 발생했어요.');
        } finally {
            setRecognizing(false);
        }
    };

    const scale = photoSize ? PREVIEW_WIDTH / photoSize.width : 1;
    const previewHeight = photoSize ? photoSize.height * scale : undefined;

    const toggleSelect = (text: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(text)) {
                next.delete(text);
            } else {
                next.add(text);
            }
            return next;
        });
    };

    const removeManualRegion = (id: string) => {
        setManualRegions(prev => prev.filter(region => region.id !== id));
    };

    const finalizeDrawnRect = (rect: Rect) => {
        if (rect.width < 12 || rect.height < 12) return;
        const orig = {
            left: rect.left / scale,
            top: rect.top / scale,
            width: rect.width / scale,
            height: rect.height / scale,
        };
        const matched = allElements.filter(el => {
            if (!el.frame) return false;
            const cx = el.frame.left + el.frame.width / 2;
            const cy = el.frame.top + el.frame.height / 2;
            return cx >= orig.left && cx <= orig.left + orig.width && cy >= orig.top && cy <= orig.top + orig.height;
        });
        if (matched.length === 0) return;
        matched.sort((a, b) => (a.frame!.top - b.frame!.top) || (a.frame!.left - b.frame!.left));
        const text =
            language === 'JA'
                ? matched.map(el => el.text.replace(JAPANESE_STRIP_PATTERN, '')).join('')
                : matched
                      .map(el => el.text.replace(/[^A-Za-z]/g, ''))
                      .join(' ')
                      .trim();
        if (!text) return;
        setManualRegions(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, text, rect }]);
    };

    const drawGesture = Gesture.Pan()
        .runOnJS(true)
        .enabled(mode === 'manual')
        .onBegin(e => {
            startPointRef.current = { x: e.x, y: e.y };
            setDrawingRect({ left: e.x, top: e.y, width: 0, height: 0 });
        })
        .onUpdate(e => {
            setDrawingRect(normalizeRect(startPointRef.current.x, startPointRef.current.y, e.x, e.y));
        })
        .onEnd(e => {
            const rect = normalizeRect(startPointRef.current.x, startPointRef.current.y, e.x, e.y);
            setDrawingRect(null);
            finalizeDrawnRect(rect);
        });

    const combinedCount = new Set([...selected, ...manualRegions.map(r => r.text)]).size;

    const handleConfirmSelection = () => {
        const combined = new Set([...selected, ...manualRegions.map(r => r.text)]);
        if (combined.size === 0) return;
        navigation.navigate('WordConfirm', { bookId, texts: Array.from(combined), language });
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {!photoUri ? (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIconWrap}>
                        <Icon name="camera" size={32} color={colors.primary} />
                    </View>
                    <Text style={styles.emptyTitle}>사진에서 단어를 찾아보세요</Text>
                    <Text style={styles.emptySubtitle}>
                        메뉴판, 책, 표지판 등 단어가 있는 사진을 촬영하거나 앨범에서 골라보세요
                    </Text>
                </View>
            ) : null}

            <View style={styles.actionRow}>
                <Button
                    label={photoUri ? '다시 촬영' : '촬영하기'}
                    onPress={() => handlePickPhoto('camera')}
                    style={styles.captureButton}
                />
                <Button
                    label="앨범에서 선택"
                    variant="secondary"
                    onPress={() => handlePickPhoto('library')}
                    style={styles.libraryButton}
                />
            </View>

            {photoUri ? (
                <View style={styles.modeToggleRow}>
                    <TouchableOpacity
                        style={[styles.modeChip, mode === 'auto' && styles.modeChipSelected]}
                        onPress={() => setMode('auto')}
                    >
                        <Text style={[styles.modeChipText, mode === 'auto' && styles.modeChipTextSelected]}>
                            자동 인식
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.modeChip, mode === 'manual' && styles.modeChipSelected]}
                        onPress={() => setMode('manual')}
                    >
                        <Text style={[styles.modeChipText, mode === 'manual' && styles.modeChipTextSelected]}>
                            직접 선택
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : null}

            {photoUri ? (
                <GestureDetector gesture={drawGesture}>
                    <View style={[styles.previewBox, { width: PREVIEW_WIDTH, height: previewHeight }]}>
                        <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                        {mode === 'auto' && photoSize
                            ? candidates.map(candidate =>
                                  candidate.frame ? (
                                      <TouchableOpacity
                                          key={candidate.text}
                                          style={[
                                              styles.highlightBox,
                                              selected.has(candidate.text) && styles.highlightBoxSelected,
                                              {
                                                  left: candidate.frame.left * scale,
                                                  top: candidate.frame.top * scale,
                                                  width: candidate.frame.width * scale,
                                                  height: candidate.frame.height * scale,
                                              },
                                          ]}
                                          onPress={() => toggleSelect(candidate.text)}
                                      />
                                  ) : null,
                              )
                            : null}
                        {mode === 'manual' ? (
                            <>
                                {manualRegions.map(region => (
                                    <View
                                        key={region.id}
                                        style={[
                                            styles.manualBox,
                                            {
                                                left: region.rect.left,
                                                top: region.rect.top,
                                                width: region.rect.width,
                                                height: region.rect.height,
                                            },
                                        ]}
                                    >
                                        <TouchableOpacity
                                            style={styles.manualBoxDelete}
                                            hitSlop={8}
                                            onPress={() => removeManualRegion(region.id)}
                                        >
                                            <Icon name="x" size={13} color={colors.white} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {drawingRect ? (
                                    <View
                                        pointerEvents="none"
                                        style={[
                                            styles.drawingBox,
                                            {
                                                left: drawingRect.left,
                                                top: drawingRect.top,
                                                width: drawingRect.width,
                                                height: drawingRect.height,
                                            },
                                        ]}
                                    />
                                ) : null}
                            </>
                        ) : null}
                    </View>
                </GestureDetector>
            ) : null}

            {recognizing ? <ActivityIndicator style={styles.spinner} size="large" color={colors.primary} /> : null}

            {mode === 'auto' && candidates.length > 0 ? (
                <View style={styles.candidateBox}>
                    <Text style={styles.candidateTitle}>인식된 단어를 선택하세요 (여러 개 선택 가능)</Text>
                    <View style={styles.chipRow}>
                        {candidates.map(candidate => (
                            <TouchableOpacity
                                key={candidate.text}
                                style={[styles.chip, selected.has(candidate.text) && styles.chipSelected]}
                                onPress={() => toggleSelect(candidate.text)}
                            >
                                <Text style={[styles.chipText, selected.has(candidate.text) && styles.chipTextSelected]}>
                                    {candidate.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            ) : null}

            {mode === 'manual' && photoUri ? (
                <View style={styles.candidateBox}>
                    <Text style={styles.candidateTitle}>이미지 위에서 드래그해서 원하는 부분을 여러 개 선택하세요</Text>
                    {manualRegions.length > 0 ? (
                        <View style={styles.chipRow}>
                            {manualRegions.map(region => (
                                <TouchableOpacity
                                    key={region.id}
                                    style={[styles.chip, styles.chipSelected, styles.chipRowInner]}
                                    onPress={() => removeManualRegion(region.id)}
                                >
                                    <Text style={[styles.chipText, styles.chipTextSelected]}>{region.text}</Text>
                                    <Icon name="x" size={12} color={colors.white} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.manualHint}>아직 선택한 영역이 없어요</Text>
                    )}
                </View>
            ) : null}

            {photoUri ? (
                <Button
                    label={combinedCount > 0 ? `선택한 단어 ${combinedCount}개 추가` : '단어를 선택하세요'}
                    onPress={handleConfirmSelection}
                    disabled={combinedCount === 0}
                    style={styles.confirmButton}
                />
            ) : null}
        </ScrollView>
    );
}

async function requestCameraPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
    return result === PermissionsAndroid.RESULTS.GRANTED;
}

function extractCandidateWords(
    blocks: { lines: { elements: { text: string; frame?: Frame }[] }[] }[],
    language: WordLanguage,
): Candidate[] {
    const seen = new Map<string, Candidate>();
    for (const block of blocks) {
        for (const line of block.lines) {
            for (const element of line.elements) {
                if (language === 'JA') {
                    const cleaned = element.text.replace(JAPANESE_STRIP_PATTERN, '');
                    if (!JAPANESE_PATTERN.test(cleaned)) continue;
                    if (!seen.has(cleaned)) {
                        seen.set(cleaned, { text: cleaned, frame: element.frame });
                    }
                } else {
                    const cleaned = element.text.replace(/[^A-Za-z]/g, '');
                    if (!WORD_PATTERN.test(cleaned)) continue;
                    const key = cleaned.toLowerCase();
                    if (!seen.has(key)) {
                        seen.set(key, { text: cleaned, frame: element.frame });
                    }
                }
            }
        }
    }
    return Array.from(seen.values()).slice(0, 30);
}

function flattenElements(blocks: { lines: { elements: { text: string; frame?: Frame }[] }[] }[]): Candidate[] {
    const elements: Candidate[] = [];
    for (const block of blocks) {
        for (const line of block.lines) {
            for (const element of line.elements) {
                elements.push(element);
            }
        }
    }
    return elements;
}

function normalizeRect(x1: number, y1: number, x2: number, y2: number): Rect {
    return {
        left: Math.min(x1, x2),
        top: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
    };
}

const styles = StyleSheet.create({
    container: { padding: spacing.lg, alignItems: 'center', flexGrow: 1 },
    emptyState: { alignItems: 'center', marginTop: spacing.xxxl, marginBottom: spacing.xl, paddingHorizontal: spacing.lg },
    emptyIconWrap: {
        width: 72,
        height: 72,
        borderRadius: radius.xxl,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    emptyTitle: { ...typography.subheading, textAlign: 'center' },
    emptySubtitle: { ...typography.caption, textAlign: 'center', marginTop: spacing.xs },
    actionRow: { flexDirection: 'row', gap: spacing.sm, width: '100%' },
    captureButton: { flex: 1, borderRadius: radius.pill },
    libraryButton: { flex: 1, borderRadius: radius.pill },
    modeToggleRow: { flexDirection: 'row', gap: spacing.sm, width: '100%', marginTop: spacing.xl },
    modeChip: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: spacing.sm,
    },
    modeChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    modeChipText: { fontSize: 13, fontWeight: '700', color: colors.textSub },
    modeChipTextSelected: { color: colors.white },
    previewBox: {
        borderRadius: radius.lg,
        marginTop: spacing.xl,
        overflow: 'hidden',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadow.card,
    },
    highlightBox: {
        position: 'absolute',
        borderWidth: 2,
        borderColor: colors.primary,
        backgroundColor: 'rgba(49, 130, 246, 0.18)',
        borderRadius: radius.sm,
    },
    highlightBoxSelected: {
        borderColor: colors.success,
        backgroundColor: 'rgba(0, 196, 113, 0.28)',
    },
    manualBox: {
        position: 'absolute',
        borderWidth: 2,
        borderColor: colors.success,
        backgroundColor: 'rgba(0, 196, 113, 0.18)',
        borderRadius: radius.sm,
    },
    manualBoxDelete: {
        position: 'absolute',
        top: -10,
        right: -10,
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: colors.danger,
        alignItems: 'center',
        justifyContent: 'center',
    },
    drawingBox: {
        position: 'absolute',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: colors.primary,
        backgroundColor: 'rgba(49, 130, 246, 0.12)',
        borderRadius: radius.sm,
    },
    manualHint: { ...typography.caption, textAlign: 'center' },
    spinner: { marginTop: spacing.xl },
    candidateBox: {
        width: '100%',
        marginTop: spacing.xxl,
        backgroundColor: colors.background,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        ...shadow.card,
    },
    candidateTitle: { ...typography.subheading, marginBottom: spacing.md },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    chip: {
        backgroundColor: colors.primaryLight,
        borderRadius: radius.pill,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
    },
    chipSelected: { backgroundColor: colors.success },
    chipRowInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    chipText: { fontSize: 14, fontWeight: '700', color: colors.primary },
    chipTextSelected: { color: colors.white },
    confirmButton: { marginTop: spacing.lg },
});
