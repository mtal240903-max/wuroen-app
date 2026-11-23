import React, { useState, useEffect } from 'react';
import { 
    StyleSheet, 
    Text, 
    View, 
    ScrollView, 
    TouchableOpacity, 
    Dimensions, 
    SafeAreaView, 
    RefreshControl, 
    Modal,
    ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { 
    ArrowLeft, 
    Bell, 
    ChevronDown, 
    TrendingUp, 
    TrendingDown, 
    Wallet, 
    Building2, 
    Target, 
    AlertTriangle,
    Check
} from 'lucide-react-native';
// Utilisation de ton instance Axios centralisée (gère l'URL de base et les tokens d'authentification)
import api from '../../../../services/api'; 

const screenWidth = Dimensions.get('window').width;

// Composant pour afficher les indicateurs clés de performance (KPIs) sous forme de cartes dégradées
const KPICard = ({ title, value, icon: Icon, trend, color }) => (
    <LinearGradient colors={['#111726', '#0F172A']} style={styles.kpiCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.kpiHeader}>
            <Text style={styles.kpiTitle}>{title}</Text>
            <Icon color={color} size={18} />
        </View>
        <Text style={styles.kpiValue}>{value}</Text>
        <View style={styles.kpiTrend}>
            {trend > 0 ? <TrendingUp size={14} color="#10B981" /> : <TrendingDown size={14} color="#EF4444" />}
            <Text style={[styles.kpiTrendText, { color: trend > 0 ? '#10B981' : '#EF4444' }]}>{Math.abs(trend)}% vs N-1</Text>
        </View>
    </LinearGradient>
);

// Mini graphique en sparkline pour visualiser la tendance rapide d'une entreprise
const SvgLineChart = ({ labels = [], series = [], width, height, compact = false }) => {
    const padding = compact
        ? { left: 2, right: 2, top: 3, bottom: 3 }
        : { left: 12, right: 10, top: 10, bottom: 24 };
    const values = series.flatMap((item) => item.data || []).map(Number).filter(Number.isFinite);
    const min = Math.min(0, ...values);
    const max = Math.max(...values, 1);
    const range = max - min || 1;
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const getPoint = (value, index, count) => ({
        x: padding.left + (count < 2 ? plotWidth / 2 : (index / (count - 1)) * plotWidth),
        y: padding.top + plotHeight - ((Number(value) - min) / range) * plotHeight,
    });

    return (
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={compact ? styles.sparkline : styles.chart}>
            {!compact && [0, 1, 2, 3].map((step) => {
                const y = padding.top + (plotHeight * step) / 3;
                return <Line key={`grid-${step}`} x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#263244" strokeWidth={1} />;
            })}
            {series.map((item, seriesIndex) => {
                const data = (item.data || []).map(Number).filter(Number.isFinite);
                const points = data.map((value, index) => getPoint(value, index, data.length));
                const color = item.color || (seriesIndex === 0 ? '#10B981' : '#EF4444');
                return (
                    <React.Fragment key={`series-${seriesIndex}`}>
                        <Polyline points={points.map(({ x, y }) => `${x},${y}`).join(' ')} fill="none" stroke={color} strokeWidth={compact ? 1.7 : 2.5} strokeDasharray={item.dashed ? '5 5' : undefined} strokeLinecap="round" strokeLinejoin="round" />
                        {!compact && points.map(({ x, y }, index) => <Circle key={`point-${index}`} cx={x} cy={y} r={3} fill={color} stroke="#0F172A" strokeWidth={1.5} />)}
                    </React.Fragment>
                );
            })}
            {!compact && labels.map((label, index) => {
                const x = getPoint(0, index, labels.length).x;
                return <SvgText key={`label-${index}`} x={x} y={height - 6} fill="#94A3B8" fontSize={9} textAnchor="middle">{String(label)}</SvgText>;
            })}
        </Svg>
    );
};

const MiniTrendLine = ({ data, color }) => (
    <SvgLineChart data={data} series={[{ data: data && data.length ? data : [0, 0], color }]} width={70} height={35} compact />
);

// Carte récapitulative de performance par entreprise
const CompanyPerformanceCard = ({ company, onPress }) => (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.companyCard}>
        <View style={styles.companyCardHeader}>
            <View style={[styles.logoContainer, { backgroundColor: company.logo_couleur || '#3B82F6' }]}>
                <Text style={styles.logoText}>{company.logo_initial || company.nom?.charAt(0) || 'W'}</Text>
            </View>
            <View style={styles.companyInfo}>
                <Text style={styles.companyName}>{company.nom}</Text>
                <MiniTrendLine data={company.trend} color={company.status === 'Sain' ? '#10B981' : '#F59E0B'} />
            </View>
        </View>
        <View style={styles.companyStats}>
            <View>
                <Text style={styles.statLabel}>VAN</Text>
                <Text style={styles.statValue}>{formatNumber(company.van || 0)}</Text>
            </View>
            <View>
                <Text style={styles.statLabel}>TRI</Text>
                <Text style={styles.statValue}>{company.tri || 0}%</Text>
            </View>
            <View style={styles.statusBadge}>
                {company.status === 'À surveiller' && <AlertTriangle size={14} color="#F59E0B" />}
                <Text style={[styles.statusText, { color: company.status === 'Sain' ? '#10B981' : '#F59E0B' }]}>
                    {company.status || 'Sain'}
                </Text>
            </View>
        </View>
    </TouchableOpacity>
);

// Fonction utilitaire pour formater les grands montants en FCFA (Milliards ou Millions)
const formatNumber = (num) => {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1).replace('.', ',') + ' Mrd FCFA';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace('.', ',') + ' M FCFA';
    }
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ' FCFA';
};

export default function FinanceOverviewScreen({ route, navigation }) {
    // Récupération sécurisée du companyId s'il est passé via la navigation (contexte workspace/page)
    const { companyId } = route.params || {};

    const [selectedPeriod, setSelectedPeriod] = useState("Janvier - Juin 2024");
    const [availablePeriods] = useState([
        "Janvier - Juin 2024", 
        "Juillet - Décembre 2024", 
        "Année 2024 (Global)"
    ]);
    const [modalVisible, setModalVisible] = useState(false);
    
    const [financeData, setFinanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    // Fonction de récupération des données connectée à ton API sécurisée
    const fetchFinanceData = async (period) => {
        try {
            setErrorMessage(null);
            
            // Adaptation dynamique de l'endpoint selon qu'on est sur une entreprise précise ou en vue globale
            const endpoint = companyId 
                ? `/workspace/companies/${companyId}/finances?period=${encodeURIComponent(period)}`
                : `/workspace/finance/overview?period=${encodeURIComponent(period)}`;

            const response = await api.get(endpoint);
            setFinanceData(response.data);
        } catch (error) {
            console.error("Erreur de chargement des données financières :", error);
            setErrorMessage("Impossible de charger les données financières. Vérifiez votre connexion.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchFinanceData(selectedPeriod);
    }, [selectedPeriod, companyId]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchFinanceData(selectedPeriod);
    };

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={[styles.container, styles.loaderContainer]}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.loaderText}>Chargement des données financières...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <ArrowLeft color="#FFF" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Vue d'ensemble financière</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.iconBtn}>
                    <Bell color="#FFF" size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
                }
            >
                {/* Sélecteur de période */}
                <TouchableOpacity style={styles.periodSelector} onPress={() => setModalVisible(true)}>
                    <Text style={styles.periodText}>Période : {financeData?.periode || selectedPeriod}</Text>
                    <ChevronDown size={16} color="#64748B" style={{marginLeft: 5}} />
                </TouchableOpacity>

                {errorMessage ? (
                    <View style={styles.errorContainer}>
                        <AlertTriangle size={24} color="#EF4444" />
                        <Text style={styles.errorText}>{errorMessage}</Text>
                        <TouchableOpacity style={styles.retryBtn} onPress={() => fetchFinanceData(selectedPeriod)}>
                            <Text style={styles.retryText}>Réessayer</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <Text style={styles.sectionTitle}>Indicateurs Globaux</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
                            <KPICard 
                                title="Chiffre d'Affaires Total" 
                                value={formatNumber(financeData?.indicateurs_globaux?.chiffre_affaires_total || 0)} 
                                icon={Wallet} 
                                trend={financeData?.indicateurs_globaux?.evolution_ca_pourcentage || 0} 
                                color="#10B981" 
                            />
                            <KPICard 
                                title="Résultat Net Global" 
                                value={formatNumber(financeData?.indicateurs_globaux?.resultat_net_global || 0)} 
                                icon={Building2} 
                                trend={financeData?.indicateurs_globaux?.evolution_resultat_pourcentage || 0} 
                                color="#6366F1" 
                            />
                            <KPICard 
                                title="Trésorerie Totale" 
                                value={formatNumber(financeData?.indicateurs_globaux?.tresorerie_totale || 0)} 
                                icon={Target} 
                                trend={financeData?.indicateurs_globaux?.evolution_tresorerie_pourcentage || 0} 
                                color="#F59E0B" 
                            />
                        </ScrollView>

                        <Text style={styles.sectionTitle}>Évolution Financière (M FCFA)</Text>
                        <View style={styles.chartWrapper}>
                            {financeData?.evolution_financiere?.labels?.length > 0 ? (
                                <SvgLineChart
                                    labels={financeData.evolution_financiere.labels}
                                    series={[
                                        { data: financeData.evolution_financiere.series_ca || [0], color: '#10B981' },
                                        { data: financeData.evolution_financiere.series_depenses || [0], color: '#EF4444', dashed: true },
                                    ]}
                                    width={screenWidth - 40}
                                    height={220}
                                />
                            ) : (
                                <Text style={styles.emptyText}>Aucune donnée graphique disponible pour cette période.</Text>
                            )}
                        </View>

                        <Text style={styles.sectionTitle}>Performance par Entreprise</Text>
                        <View style={styles.companyList}>
                            {financeData?.performance_entreprises?.length > 0 ? (
                                financeData.performance_entreprises.map((company) => (
                                    <CompanyPerformanceCard 
                                        key={company.id} 
                                        company={company} 
                                        onPress={() => navigation.navigate('CompanyDetail', { companyId: company.id, companyName: company.nom })} 
                                    />
                                ))
                            ) : (
                                <Text style={styles.emptyText}>Aucune entreprise trouvée.</Text>
                            )}
                        </View>
                    </>
                )}
            </ScrollView>

            {/* Modale de sélection de période */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Sélectionner une période</Text>
                        {availablePeriods.map((periodKey) => (
                            <TouchableOpacity 
                                key={periodKey} 
                                style={[styles.modalItem, selectedPeriod === periodKey && styles.modalItemSelected]}
                                onPress={() => {
                                    setSelectedPeriod(periodKey);
                                    setModalVisible(false);
                                }}
                            >
                                <Text style={[styles.modalItemText, selectedPeriod === periodKey && styles.modalItemTextSelected]}>
                                    {periodKey}
                                </Text>
                                {selectedPeriod === periodKey && <Check size={18} color="#6366F1" />}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity 
                            style={styles.modalCloseBtn} 
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.modalCloseText}>Fermer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#090D1A' },
    loaderContainer: { justifyContent: 'center', alignItems: 'center' },
    loaderText: { color: '#94A3B8', marginTop: 12, fontSize: 14, fontWeight: '500' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, backgroundColor: '#090D1A' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFF' },
    iconBtn: { padding: 8, backgroundColor: '#111726', borderRadius: 12 },
    scrollContent: { paddingBottom: 30 },
    periodSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15 },
    periodText: { fontSize: 14, color: '#94A3B8', fontWeight: '600' },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#F1F5F9', marginTop: 20, marginBottom: 15, paddingHorizontal: 20 },
    kpiScroll: { paddingLeft: 20, paddingRight: 10 },
    kpiCard: { width: screenWidth * 0.42, height: 130, borderRadius: 24, padding: 15, marginRight: 15, justifyContent: 'space-between', borderWidth: 1, borderColor: '#1E293B' },
    kpiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    kpiTitle: { fontSize: 11, color: '#94A3B8', fontWeight: '600', flex: 1 },
    kpiValue: { fontSize: 18, fontWeight: '800', color: '#FFF', marginTop: 5 },
    kpiTrend: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    kpiTrendText: { fontSize: 11, fontWeight: '600', marginLeft: 4 },
    chartWrapper: { paddingHorizontal: 20, alignItems: 'center' },
    chart: { borderRadius: 16, paddingRight: 0 },
    companyList: { paddingHorizontal: 20 },
    companyCard: { backgroundColor: '#111726', borderRadius: 20, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#1E293B' },
    companyCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    logoContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    logoText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
    companyInfo: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 12 },
    companyName: { fontSize: 14, fontWeight: '700', color: '#FFF', flex: 1 },
    sparkline: { marginVertical: 0 },
    companyStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#1E293B' },
    statLabel: { fontSize: 10, color: '#64748B', fontWeight: '600' },
    statValue: { fontSize: 13, fontWeight: '700', color: '#FFF', marginTop: 2 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#090D1A', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 11, fontWeight: '600', marginLeft: 4 },
    errorContainer: { padding: 30, alignItems: 'center', justifyContent: 'center' },
    errorText: { color: '#94A3B8', textAlign: 'center', marginTop: 10, fontSize: 14 },
    retryBtn: { marginTop: 15, backgroundColor: '#6366F1', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
    retryText: { color: '#FFF', fontWeight: '600' },
    emptyText: { color: '#64748B', textAlign: 'center', fontStyle: 'italic', paddingVertical: 10 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(2, 6, 23, 0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { width: '100%', maxWidth: 340, backgroundColor: '#111726', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#1E293B' },
    modalTitle: { fontSize: 16, fontWeight: '700', color: '#FFF', marginBottom: 15, textAlign: 'center' },
    modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 12, marginBottom: 8 },
    modalItemSelected: { backgroundColor: '#1E293B' },
    modalItemText: { fontSize: 14, color: '#94A3B8', fontWeight: '500' },
    modalItemTextSelected: { color: '#FFF', fontWeight: '700' },
    modalCloseBtn: { marginTop: 15, backgroundColor: '#1E293B', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
    modalCloseText: { color: '#FFF', fontWeight: '600', fontSize: 14 }
});
