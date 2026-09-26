import { usePageUrl } from '@/hooks/use-page-url';

import { Input } from '@/components/ui/input';

export const UsersDataTableToolbar = () => {
    const { setParams, getParam } = usePageUrl();
    return (
        <div>
            <form
                onSubmit={(e) => {
                    e.preventDefault();

                    const formData = new FormData(e.currentTarget);
                    setParams({
                        search: formData.get('search')?.toString() || null,
                    });
                }}
                className="flex max-w-[15rem]"
            >
                <Input
                    id="search"
                    name="search"
                    placeholder="🔎 ID, nombre, slug"
                    defaultValue={getParam('search') || undefined}
                    onChange={(e) => {
                        if (e.target.value === '') {
                            setParams({
                                search: null,
                            });
                        }
                    }}
                />
            </form>
        </div>
    );
};
