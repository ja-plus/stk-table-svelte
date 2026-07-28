<script lang="ts">
    import StkTable from '../../StkTable.svelte';
    import { useI18n } from '../../hooks/useI18n/index';

    const { t } = useI18n();

    const generateData = (count: number) => {
        return Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            name: `Name${i + 1}`,
            age: Math.floor(Math.random() * 50) + 18,
            email: `user${i + 1}@example.com`,
            address: `Address${Math.floor(Math.random() * 1000) + 1}`,
            phone: `138${Math.floor(Math.random() * 100000000) + 100000000}`,
            company: `Company${i + 1}`,
            department: `Department${i + 1}`,
            position: `Position${i + 1}`,
            salary: Math.floor(Math.random() * 100000) + 50000,
        }));
    };

    let dataSource = $state(generateData(100));

    let columns = $state([
        { dataIndex: 'id', title: t('ID'), width: 80 },
        { dataIndex: 'name', title: t('Name'), width: 120 },
        { dataIndex: 'age', title: t('Age'), width: 80 },
        { dataIndex: 'email', title: t('Email'), width: 200 },
        { dataIndex: 'address', title: t('Address'), width: 250 },
        { dataIndex: 'phone', title: t('Phone'), width: 150 },
        { dataIndex: 'company', title: t('Company'), width: 200 },
        { dataIndex: 'department', title: t('Department'), width: 150 },
        { dataIndex: 'position', title: t('Position'), width: 150 },
        { dataIndex: 'salary', title: t('Salary'), width: 120 },
        // dataIndex 重复的列需要指定唯一 key，否则 svelte keyed each 会因 key 重复报错
        { key: 'id2', dataIndex: 'id', title: t('ID'), width: 80 },
        { key: 'name2', dataIndex: 'name', title: t('Name'), width: 120 },
        { key: 'age2', dataIndex: 'age', title: t('Age'), width: 80 },
        { key: 'email2', dataIndex: 'email', title: t('Email'), width: 200 },
        { key: 'address2', dataIndex: 'address', title: t('Address'), width: 250 },
        { key: 'phone2', dataIndex: 'phone', title: t('Phone'), width: 150 },
    ]);
</script>

<div class="demo-container">
    <div class="demo-item">
        <h4>scrollbar</h4>
        <StkTable style="height: 200px" virtual scrollbar {columns} {dataSource}></StkTable>
    </div>
    <div class="demo-item">
        <h4>:scrollbar="&#123; width: 12, height: 12 &#125;"</h4>
        <StkTable style="height: 200px" virtual scrollbar={{ width: 12, height: 12 }} {columns} {dataSource}></StkTable>
    </div>
</div>

<style>
    .demo-container {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .demo-item {
        padding: 20px;
        border-radius: 8px;
    }

    .demo-item h4 {
        margin: 0 0 10px 0;
        font-size: 16px;
    }
</style>
